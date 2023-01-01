let   controlText  = document.getElementById("control-text");

if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)){
	controlText.innerHTML = "Ovládajte pomocou slidovania po obrazovke alebo po stlačení tlačidla nakláňaním telefónu"
  }else{
    controlText.innerHTML = "Ovládajte pomocou kláves WASD alebo šipkami";
  }
