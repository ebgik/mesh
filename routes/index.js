
var page = require('libs/module_page');
var user = require('libs/module_user');
var message = require('libs/module_message');

module.exports = function(app) {


  app.get('/',function(req,res,next){
    if (req.cookies.session&&req.cookies.session!='null')
        {
          res.writeHead(302, { 'Location': '/messages'});
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
            //console.log(resultSession)
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

  app.get('/messages',function(req,res,next){
      if (req.cookies.session&&req.cookies.session!='null')
      {
        //console.log(req.cookies.session);
        user.checkSession(req.cookies.session,function(resultUser){
          if (resultUser!='error')
            if (resultUser=='none') 
            {
              res.clearCookie('session');
              res.writeHead(302, { 'Location': '/'})
              res.end();
            }
            else
            {
              if (req.query.sel)
                user.getUserInfo(req.query.sel,function(resUser){
                  if (resUser=='error') next();
                  else 
                    page.getPage(2,function(err,result){
                      if (err) next(new Error('problem BD'));
                      else
                      {
                        if (result=='none') next();
                        else
                          message.getMessages(resultUser[0].id,req.query.sel,function(errMess,resMess){
                            if (errMess) next(new Error('problem BD'));
                              else
                                res.render('messages',{
                                  title : result.title,
                                  meta_k : result.keywords,
                                  meta_d : result.description,
                                  user : resultUser[0],
                                  sel : resUser,
                                  messages : resMess
                                });                      
                          })  
                      }               
                    })
                })
              else
              {
                page.getPage(3,function(err,result){
                  if (err) next(new Error('problem BD'));
                  else
                  {
                    if (result=='none') next();
                    else
                      message.getDialogues(resultUser[0].id,function(errDial,resDial){
                        if (errDial) next(new Error('problem BD'));
                        else
                          res.render('dialogues',{
                            title : result.title,
                            meta_k : result.keywords,
                            meta_d : result.description,
                            user : resultUser[0],
                            dialogues: resDial
                          });                      
                      })  
                  }               
                })
              }
            }
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
          id_sel = req.body.id_sel,
          messageText = req.body.message;
      message.addMessage(id_sender,id_sel,messageText,function(result){
        res.send(result);
      })
  })


  app.post('/readingmess',function(req,res,next){
      var id_sender = req.body.id_sender,
          id_sel = req.body.id_sel;
      message.reading(id_sender,id_sel,function(result){
        res.send(result);
      })
  })

  app.post('/getuserinfo',function(req,res,next){
    var id = req.body.id;
    user.getUserInfo(id,function(result){
      //console.log(result)
      res.send(result);
    })
  })

  app.post('/search_mess',function(req,res,next){
    var str = req.body.str;
    user.searchUsers(str,function(result){
      res.send(result)
    })
  })

  app.post('/addsocket',function(req,res,next){
    var cook = req.body.cook,
        sock = req.body.sock;
    user.addSocket(cook,sock,function(err,result){
      if (err) next(new Error('problem BD'))
      else res.send(result)
    })
  })
}