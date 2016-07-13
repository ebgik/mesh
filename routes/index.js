
var page = require('libs/module_page');
var user = require('libs/module_user');
var message = require('libs/module_message');

module.exports = function(app) {


  app.get('/',function(req,res,next){
    if (req.cookies.session&&req.cookies.session!='null')
        {
          res.writeHead(302, { 'Location': '/profile'});
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
                              {
                                var pee = '';
                                if (req.query.peers) pee = req.query.sel+'_'+req.query.peers;
                                else pee = req.query.sel;

                                user.getPeers(pee,function(resPeers){
                                  //console.log(resPeers)
                                  res.render('messages',{
                                    title : result.title,
                                    meta_k : result.keywords,
                                    meta_d : result.description,
                                    user : resultUser[0],
                                    sel : resUser,
                                    messages : resMess,
                                    peers : resPeers
                                  }); 
                                })     
                              }               
                          })  
                      }               
                    })
                })
              else
              {
                var showDia = false;
                if (req.cookies.peers) showDia = true;
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
                            dialogues: resDial,
                            showBut : showDia
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

app.get('/messcont',function(req,res,next){
    var sel = 0;
    var peers = '';
    //console.log(req.cookies.peers);
    if (req.query.sel)
    {
      sel = req.query.sel;
      var adress = '/messages?sel='+sel;
      if (req.cookies.peers)
      {
        peers = req.cookies.peers;
        var strPeers = peers.split(',');
        console.log(strPeers)
        if (strPeers.indexOf(req.query.sel)==-1)
        {
          peers+=','+req.query.sel;
          strPeers.push(req.query.sel);
        }

        if (strPeers.length>1)
        {
          adress += '&peers=';
          var str = '';
          for(var i = 0; i<strPeers.length; i++)
          {
            
            if (strPeers[i]!=sel)
            {
              if (str!='') str+='_';
                str+=strPeers[i];
            }

          }
          adress +=str;
        }
      }
      else 
        peers=req.query.sel;

      res.cookie('peers',peers);

      res.writeHead(302, { 'Location': adress});
      res.end();
    }
    else
    {
      if (req.cookies.peers)
      {
        peers = req.cookies.peers;
        var strPeers = peers.split(',');

        var adress = '/messages?sel='+strPeers[0];
        if (strPeers.length>1)
        {
          //console.log(strPeers);
          adress += '&peers=';
          for(var i = 1; i<strPeers.length; i++)
          {
            if (i!=1) adress+='_';
            adress+=strPeers[i];
            //console.log(adress);
          }
        }
        res.writeHead(302, { 'Location': adress});
        res.end();
      }
      else
      {
        res.writeHead(302, { 'Location': '/messages'});
        res.end();
      }
    }
})

  app.get('/profile',function(req,res,next){
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
              if (req.query.id)
                user.getUserInfo(req.query.id,function(resUser){
                  if (resUser=='error') next();
                  else 
                    res.render('profile',{
                      title : resUser.name,
                      meta_k : resUser.name,
                      meta_d : resUser.name,
                      user : resultUser[0],
                      userInfo : resUser,
                      my : 'no'
                    });                      
                })
              else
              {
                res.render('profile',{
                  title : resultUser[0].name,
                  meta_k : resultUser[0].name,
                  meta_d : resultUser[0].name,
                  user : resultUser[0],
                  userInfo : resultUser[0],
                  my : 'yes'
                });                      
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