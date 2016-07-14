$(document).ready(function(){




	$('#adminForm').submit(function(){
		var data = $(this).serializeArray();
		$.ajax({
			type:'POST',
			url:'auth',
			data:data,
			success:function(data){
				//console.log(data)
				if (data.user!='not_user'&&data.session!='none')
				{
					$.cookie('session',data.session);
					document.location.href = '/profile';
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

	$('#regForm').submit(function(){
		var data = $(this).serializeArray();
		$.ajax({
			type:'POST',
			url:'/registration',
			data:data,
			success:function(data){
				console.log(data)
				if (data=='err_pass')
				{
					$('[name=double_pass]').closest('.form-group').addClass('has-error');
					$('#error').html('Пароли не совпадают!');
					setTimeout(function(){
						$('input').closest('.form-group').removeClass('has-error');
						$('#error').html('');
					},1000)
				}
				if (data=='error')
				{
					$('#error').html('Ошибка сервера!');
					setTimeout(function(){
						$('#error').html('');
					},1000)
				}
				if (data=='success')
				{
					$('#success').html('Регистрация прошла успешно! Вы можете зайти под своим аккаунтом!');
					$('input').attr('disabled','disabled');
					setTimeout(function(){
						document.location.href = '/';
					},1000)
				}
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