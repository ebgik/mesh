$(document).ready(function(){
	var kemoji = KEmoji.init('myEmoji', {
	        		smileContainerWidth: 280,
	                smileContainerHeight: 202,
	                smiles: ["D83DDE0A","D83DDE03","D83DDE09","D83DDE06","D83DDE1C","D83DDE0B","D83DDE0D","D83DDE0E","D83DDE12","D83DDE0F","D83DDE14","D83DDE22","D83DDE2D","D83DDE29","D83DDE28","D83DDE10","D83DDE0C","D83DDE04","D83DDE07","D83DDE30","D83DDE32","D83DDE33","D83DDE37","D83DDE02","2764","D83DDE1A","D83DDE15","D83DDE2F","D83DDE26","D83DDE35","D83DDE20","D83DDE21","D83DDE1D","D83DDE34","D83DDE18","D83DDE1F","D83DDE2C","D83DDE36","D83DDE2A","D83DDE2B","263A","D83DDE00","D83DDE25","D83DDE1B","D83DDE16","D83DDE24","D83DDE23","D83DDE27","D83DDE11","D83DDE05","D83DDE2E","D83DDE1E","D83DDE19","D83DDE13","D83DDE01","D83DDE31","D83DDE08","D83DDC7F","D83DDC7D","D83DDC4D","D83DDC4E","261D","270C","D83DDC4C","D83DDC4F","D83DDC4A","270B","D83DDE4F","D83DDC43","D83DDC46","D83DDC47"]
                });


	$( "#resizable" ).resizable({
		containment: "#container",
		handles: 's',
     	minHeight: 250
    });



	var pane = $('.wrap-mess');
		pane.jScrollPane();
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


	$('#submitMessage').click(function(){
		var input = $('.KEmoji_Block .KEmoji_Input > div[contenteditable=true]');
		var message = input.html();
		var id_sender = $('#id_user').val();
		$.ajax({
			type:'POST',
			url:'/addmessage',
			data:{
				id_sender:id_sender,
				message:message
			},
			success:function(data){
				if (data=='success')
				{
					input.html('');
					socket.emit('message',{ id_sender : id_sender, message : message });
				}
			}
		})
	})

	$( "#resizable" ).resize(function(){
        api.reinitialise();
		api.scrollTo(0,10000);

	})
	$(window).resize(function(){
        api.reinitialise();
		api.scrollTo(0,10000);

	})

	socket.on('message', function(msg){
      		var id_sender = msg.id_sender,
      			message = msg.message;
      		$.ajax({
      			type:'POST',
      			url:'/getuserinfo',
      			data:'id='+id_sender,
      			success:function(data){
      				if (data!='error')
      				{
      					var html="<div class='col-md-8 col-md-offset-2 message'>";
						html+="<p>"+data.name+"</p>";
						html+="<p>"+message+"</p>";
						html+="</div>";
      					$(html).appendTo('.jspPane');
                    	api.reinitialise();
						api.scrollTo(0,10000);
      				}
      			}
      		})
      })
})