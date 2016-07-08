$(document).ready(function(){
	var socket = io('http://127.0.0.1:7034');

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
					location.reload();
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