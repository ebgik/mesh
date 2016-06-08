$(document).ready(function(){




	$('#adminForm').submit(function(){
		var data = $(this).serializeArray();
		$.ajax({
			type:'POST',
			url:'auth',
			data:data,
			success:function(data){
				if (data.user!='not_user'&&data.session!='none')
				{
					$.cookie('session',data.session);
					document.location.href = '/main';
				}
				else
				{
					$('input').closest('.form-group').addClass('has-error');
				}
				setTimeout(function(){
					$('input').closest('.form-group').removeClass('has-error');
				},1000)
			}
		})
		return false;
	})



	$('#exit').click(function(){
		$.ajax({
			type:'POST',
			url:'/deletesession',
			data:'session='+$.cookie('session'),
			success:function(data){
				if (data=='success')
				{
					$.cookie('session',null);
					location.reload();
				}
			}
		})
		
		return false;
	})



	
})