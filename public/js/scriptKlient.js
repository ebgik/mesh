$(document).ready(function(){
	var socket = io('http://188.225.38.167:7034');
	if ($('#myEmoji').length>0)
	{
		var kemoji = KEmoji.init('myEmoji', {
		        		smileContainerWidth: 280,
		                smileContainerHeight: 202,
		                smiles: ["D83DDE0A","D83DDE03","D83DDE09","D83DDE06","D83DDE1C","D83DDE0B","D83DDE0D","D83DDE0E","D83DDE12","D83DDE0F","D83DDE14","D83DDE22","D83DDE2D","D83DDE29","D83DDE28","D83DDE10","D83DDE0C","D83DDE04","D83DDE07","D83DDE30","D83DDE32","D83DDE33","D83DDE37","D83DDE02","2764","D83DDE1A","D83DDE15","D83DDE2F","D83DDE26","D83DDE35","D83DDE20","D83DDE21","D83DDE1D","D83DDE34","D83DDE18","D83DDE1F","D83DDE2C","D83DDE36","D83DDE2A","D83DDE2B","263A","D83DDE00","D83DDE25","D83DDE1B","D83DDE16","D83DDE24","D83DDE23","D83DDE27","D83DDE11","D83DDE05","D83DDE2E","D83DDE1E","D83DDE19","D83DDE13","D83DDE01","D83DDE31","D83DDE08","D83DDC7F","D83DDC7D","D83DDC4D","D83DDC4E","261D","270C","D83DDC4C","D83DDC4F","D83DDC4A","270B","D83DDE4F","D83DDC43","D83DDC46","D83DDC47"]
	                });
	}
	


	$( "#resizable" ).resizable({
		containment: "#container",
		handles: 's',
     	minHeight: 250
    });


	var pane = $('.wrap-mess');
		pane.jScrollPane({
		   contentWidth: '0px'
		});
	var api = pane.data('jsp');
		api.scrollTo(0,10000);

	var timeout;
	pane.scroll(function(){
		var el = $(this);
		el.find('.jspDrag').css('opacity',1);   
		clearTimeout(timeout);  
		timeout = setTimeout(function(){
			el.find('.jspDrag').css('opacity',0)
		},500)                 
	})

	$('.KEmoji_Block .KEmoji_Cont > div').scroll(function(){
		var el = $(this);
		el.find('.jspDrag').css('opacity',1);   
		clearTimeout(timeout);  
		timeout = setTimeout(function(){
			el.find('.jspDrag').css('opacity',0)
		},500)                 
	})
	var messageInput = $('.KEmoji_Block .KEmoji_Input > div[contenteditable=true]');

	$('#submitMessage').click(function(){
		var message = messageInput.html();
		var id_sender = $('#id_user').val();
		var id_sel = $('#id_sel').val();
		if (message!='')
		$.ajax({
			type:'POST',
			url:'/addmessage',
			data:{
				id_sender:id_sender,
				id_sel:id_sel,
				message:message
			},
			success:function(data){
				if (data.result=='success')
				{
					messageInput.html('');
					socket.emit('message',{ id_sender : id_sender, id_sel : id_sel, message : message, date: data.date });
				}
			}
		})
	})



	messageInput.keypress(function (e) {
                e = e || window.event;
                if (e.keyCode === 13 && e.shiftKey) {
                    $('#submitMessage').click();
                }
                else
                {
                	var id_sel = $('#id_sel').val(),
						id_sender = $('#id_user').val();
                	socket.emit('typing',{ id_sender : id_sender, id_sel : id_sel});
                }
            })

	messageInput.focus(function(){
		$('body,html').animate({
            scrollTop: 10000
        }, 400);
		var id_sender = $('#id_user').val();
		var id_sel = $('#id_sel').val();
		var countNoread = $('.no-read').length;
		if (countNoread>0)
			$.ajax({
				type:'POST',
				url:'/readingmess',
				data:{
					id_sender:id_sender,
					id_sel:id_sel,
				},
				success:function(data){
					if (data=='success')
					{
						socket.emit('read',{ id_sender : id_sender, id_sel : id_sel});
					}
				}
			})
		//console.log(countNoread);
	})



	$( "#resizable" ).resize(function(){
        api.reinitialise();
		api.scrollTo(0,10000);
	})
	$(window).resize(function(){
        api.reinitialise();
		api.scrollTo(0,10000);
	})

	$('#search_mess').keyup(function(){
		var str = $(this).val();
		if (str=='')
			$('.result_search').html('');
		else
		$.ajax({
			type:'POST',
			url:'/search_mess',
			data:'str='+str,
			success:function(data){
				if (data=='none'||data=='error')
				{
					var html = "<div class='none'>Нет результатов</div>";
				}
				else
				{
					var html = '';
					data.forEach(function(item, i, arr){
						html += "<a href='messages?sel="+item.id+"'><div class='single_search'><img class='ava' src='"+item.image+"'/> "+item.name+"</div></a>";
					})
				}
				$('.result_search').html(html);
			}
		})
	})	
	$('.menu>a').click(function(){
		if ($('.submenu').hasClass('show'))
			$('.submenu').removeClass('show');
		else
			$('.submenu').addClass('show');
	})

	$('#exit').click(function(){
		
		$.ajax({
			type:'POST',
			url:'deletesession',
			success:function(data){
				if (data=='success')
					window.location = "/";
			}
		})
	})

	socket.on('connect',function(){
		//console.log($.cookie('session'))
		if ($.cookie('session'))
		$.ajax({
			type:'POST',
			url:'/addsocket',
			data:{
				sock : socket.json.id,
				cook : $.cookie('session'),
			}
		})
	})


	socket.on('message', function(msg){
		var id_sender = msg.id_sender,
			id_sel = msg.id_sel,
			id_sel_my = $('#id_sel').val(),
			id_send_my = $('#id_user').val();
		
		if ($('.none').length>0) $('.none').remove();
      		var message = msg.message,
      			date = msg.date;
      		$.ajax({
      			type:'POST',
      			url:'/getuserinfo',
      			data:'id='+id_sender,
      			success:function(data){
      				if (data!='error')
      				{
      					if ((id_sender==id_sel_my&&id_sel==id_send_my)||(id_sender==id_send_my&&id_sel==id_sel_my))
						{
	      					var html="<div class='col-md-8 col-md-offset-2 message no-read' data-num='"+id_sel+"'>";
	      					html+="<div class='col-xs-2 wrap-text'>";
							html+="<img src='"+data.image+"' class='avatar'/>";
							html+="</div>";
							html+="<div class='col-xs-10'>";
							html+="<span class='name'>"+data.name+"</span>";
							html+="<span class='date'>"+date+"</span>";
							html+="<p>"+message+"</p>";
							html+="</div>";
							html+="<div class='clearfix'></div>";
							html+="</div>";
	      					$(html).appendTo('.jspPane');
	                    	api.reinitialise();
							api.scrollTo(0,10000);
      					}
						else
						{
							if ($('#dialogues').length>0)
							{
								var dialog = $('#dialogues').find('.dialog[data-num='+id_sender+']');
								if (dialog.length>0)
								{
									dialog.find('.mess-text').html('<img class="ava" src="'+data.image+'"/> '+message);
									dialog.find('.mess-text').addClass('no-read');
									dialog.find('.date_dialog').html(date);
									var parent = dialog.closest('a');
									$(parent).detach().prependTo('#dialogues');	
								}
								else
								{
									var html = "<a href='/messages?sel="+id_sender+"'>";
										html += "<div class='col-md-12 message dialog' data-num='"+id_sender+"'>";
										html += "<div class='col-md-4 col-xs-6'>";
										html += "<div class='col-xs-4 wrap-text'>";
										html += "<img src='"+data.image+"' class='avatar'/>"; 
										html += "</div>";
										html += "<div class='col-xs-8 dialog_name'>";
										html += "<p class='name'>"+data.name+"</p>";
										html += "<p class='date_dialog'>"+date+"</p>";
										html += "</div></div>";
										html += "<div class='col-md-8 col-xs-6'>";
										html += "<p class='mess-text no-read'>";
										html += "<img class='ava' src='"+data.image+"'/> "+message+"</p>";
										html += "</div><div class='clearfix'></div></div></a>";
									$(html).prependTo('#dialogues');		
								}	
							}
							else
							{
								var html = "<div class='overlay-mess message'>";
									html+= "<div class='col-md-12'>";
									html+= "<div class='col-xs-3 wrap-text left'>";
									html+= "<img src='"+data.image+"' class='avatar'/>"; 
									html+= "</div>";
									html+= "<div class='col-xs-9 dialog_name'>";
									html+= "<p class='name'>"+data.name+"</p>";
									html+= "<p class='date_dialog'>"+date+"</p>";
									html+= "</div></div>";
									html+= "<div class='col-md-12'>";
									html+= "<p class='mess-text'>"+message+"</p>";
									html+= "</div>";
									html+= "<div class='clearfix'></div>";
									html+= "</div>";
								$(html).prependTo('.overlay');
								$('.overlay-mess:first-child').fadeIn();
								setTimeout(function(){$('.overlay-mess:first-child').remove();},3000)
							}
						}
      				}
      			}
      		})	
		
    })

var inter;
	socket.on('typing',function(msg){
		var id_sender = msg.id_sender,
			id_sel = msg.id_sel,
			id_sel_my = $('#id_sel').val(),
			id_send_my = $('#id_user').val();
		if ((id_sender==id_sel_my&&id_sel==id_send_my))
		{
			$.ajax({
      			type:'POST',
      			url:'/getuserinfo',
      			data:'id='+id_sender,
      			success:function(data){
      				if ($('.typing').length==0)
      				{
					var html = "<div class='col-md-8 col-md-offset-2 typing'>";
						html+= "<div class='img_animate'>";
						html+= "<img src='/images/pencil.png'/>";
						html+= "</div>"+data.name+" набирает сообщение</div>";
						$(html).appendTo('.jspPane');
	                    api.reinitialise();
						api.scrollTo(0,10000);
					}
					clearTimeout(inter);
					inter = setTimeout(function(){
						$('.typing').remove();
	                    api.reinitialise();
						api.scrollTo(0,10000);
					},400)
				}
			})
		}
	})

	socket.on('read', function(msg){
		//console.log(msg)
		var id_sender = $('#id_user').val();
		if (id_sender == msg.id_sender||id_sender == msg.id_sel)
		{
			$('.message[data-num='+msg.id_sender+']').removeClass('no-read');
		}
			$('.dialog[data-num='+msg.id_sender+']').find('.mess-text').removeClass('no-read');

	})


})