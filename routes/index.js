
var page = require('libs/module_page');
var user = require('libs/module_user');
var message = require('libs/module_message');

module.exports = function(app) {


  app.get('/',function(req,res,next){
    if (req.cookies.session&&req.cookies.session!='null')
        {
          res.writeHead(302, { 'Location': '/main'});
          res.end();
        }
    else
        page.getPage(1,function(err,result){
          if (err) next(new Error('problem BD'));
          else
            if (result=='none') next();
            else
            res.render('auth',{
              title : result.title,
              meta_k : result.keywords,
              meta_d : result.description
            });
        })
          
  })  

  app.post('/auth',function(req,res,nest){
    var email = req.body.email,
        pass = req.body.pass;
      user.checkUser(email,pass,function(result){
        if (result!='none'&&result!='error')
          user.sendSession(result,function(resultSession){
            res.send({'user':result.id,'session':resultSession});
          })
        else
            res.send({'user':'not_user','session':'none'});
      })
  })

  app.post('/deletesession',function(req,res,next){
      var session = req.body.session;
      user.deleteSession(session,function(result){
        res.send(result)
      })
  })

  app.get('/main',function(req,res,next){
      if (req.cookies.session&&req.cookies.session!='null')
      {
        user.checkSession(req.cookies.session,function(resultUser){
          if (resultUser!='error'&&resultUser[0])
               page.getPage(2,function(err,result){
                  if (err) next(new Error('problem BD'));
                  else
                    if (result=='none') next();
                    else
                    message.getMessages(20,function(errMess,resMess){
                    if (err) next(new Error('problem BD'));
                      else
                      {
                        console.log(resMess)
                        res.render('main',{
                          title : result.title,
                          meta_k : result.keywords,
                          meta_d : result.description,
                          user : resultUser[0],
                          messages:resMess
                        });
                      }
                      
                    }) 
                  })
            else next(new Error('problem BD'));
        })
      }
      else
      {
        res.writeHead(302, { 'Location': '/'})
        res.end();
      }
  }) 

  
  app.post('/addmessage',function(req,res,next){
      var id_sender = req.body.id_sender,
          messageText = req.body.message;
      message.addMessage(id_sender,messageText,function(result){
        res.send(result);
      })
  })

  app.post('/getuserinfo',function(req,res,next){
    var id = req.body.id;
    user.getUserInfo(id,function(result){
      console.log(result)
      res.send(result);
    })
  })
}