let   controlText  = document.getElementById("control-text");

if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)){
    // Implement sensor
        console.log('mobile');
      controlText.innerHTML = "Ovládajte pomocou slidovania po obrazovke alebo po stlačení tlačidla nakláňaním telefónu"
  }else{
    console.log('desktop');
    controlText.innerHTML = "Ovládajte pomocou kláves WASD alebo šipkami";
  }
  