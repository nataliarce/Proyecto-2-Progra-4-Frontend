  //variables
  var doctores = new Array();
  var dias = 
          [{nombre:"Monday"},{nombre:"Tuesday"},
            {nombre:"Wednesday"},{nombre:"Thursday"},{nombre:"Friday"}];
  var doctor = 
          {idDoctor:"", nombre:"",costoConsulta:0, 
            frecuencia:0,especialidad:"", localidad:"", 
            presentacionDoctor:"",usuario:{idUsuario:"",contrasena:"", tipo:"Doctor"},
            estadoDoctor:0, horarios:[], pacientes:[]};
  var pacientes = new Array();
  var horarios = new Array();
  var presentacionDoctor = "";
  var usuario = 
          {
              idUsuario:"",
              contrasena:"",
              tipo: "Doctor"
          };
  var estadoDoctor=0;
  var id="";
  var backend = "http://localhost:8080/Proyecto2_ExpedienteMedicoBackEnd/api";
  const NET_ERR=999;
  var url ="http://localhost:8080/Proyecto2_ExpedienteMedico";
  const formularioUI = document.querySelector('#registroForm');
  
    function errorMessage(status, place)
    {  
        switch(status){
            case 404: error= "Registro no encontrado"; break;
            case 403: case 405: error="Usuario no autorizado"; break;
            case 406: case 405: error="Usuario ya existe"; break;
            case NET_ERR: error="Error de comunicación"; break;
        };            
        place.html('<div class="alert alert-danger fade show">' +
        '<button type="button" class="close" data-dismiss="alert">' +
        '&times;</button><h4 class="alert-heading">Error!</h4>'+error+'</div>');
        return;        
    } 
    
    
    function render(){
        $("#id").val(doctor.idDoctor);
        $("#contrasena").val(doctor.contrasena);
        $("#nombre").val(doctor.nombreDoctor);
        $("#especialidad").val(doctor.especialidad);
        $("#tarifa").val(doctor.costoConsulta);    
        $("#localidad").val(doctor.localidad);
        $("#frecuencia").val(doctor.frecuencia);
        $("#presentacionDoctor").val(doctor.presentacionDoctor);
        
        $(".timeAndDay").each(function(index, element)
        {
            if(doctor.horarios.length !== 0)
            {
                $(element).find(".dayName").val(doctor.horarios[index].dia);
                $(element).find(".from").val(doctor.horarios[index].desde);
                $(element).find(".to").val(doctor.horarios[index].hasta);

                if(doctor.horarios[index].seleccionado === 1)
                {

                    $(element).find(".dayCheckBox").prop("checked", true);
                    showContent(index);
                }
                else
                {
                    $(element).find(".dayCheckBox").prop("checked", false);
                }
            }
     
        });
        switch (mode)
        {
            case 'E':
                $("#cedula").prop("readonly", true );
                $('#registrar').off('click').on('click', update);
                break;
            case 'A':
                makenew();
                break;
        }
    }

    function cleanScreen()
    {
        $("#id").val("");
        $("#contrasena").val("");
        $("#nombre").val("");
        $("#especialidad").val("");
        $("#tarifa").val("");    
        $("#localidad").val("");
        $("#frecuencia").val("");
        $("#presentacionDoctor").val("");
    }

    function loadDoctorData()
    {

        let idDoctor = document.getElementsByName("idDoctor")[0].value;
        let contrasena = document.getElementsByName("contrasena")[0].value;
        let nombre = document.getElementsByName("nombre")[0].value;
        let especialidad = document.getElementsByName("especialidad")[0].value;
        let costoConsulta = document.getElementsByName("costoConsulta")[0].value;
        let localidad = document.getElementsByName("localidad")[0].value;
        let frecuencia = document.getElementsByName("frecuencia")[0].value;
        let presentacionDoctor = document.getElementsByName("presentacionDoctor")[0].value;
        
        
        doctor.idDoctor = idDoctor;
        doctor.nombre = nombre;
        doctor.especialidad = especialidad;
        doctor.costoConsulta = parseInt(costoConsulta);
        doctor.localidad = localidad;
        doctor.frecuencia = parseInt(frecuencia,10);
        
        doctor.horarios = horarios;
        doctor.pacientes = pacientes;
        doctor.presentacionDoctor = presentacionDoctor;
        usuario.contrasena = contrasena;
        usuario.idUsuario = doctor.idDoctor;
        doctor.usuario = usuario;
        doctor.estadoDoctor= estadoDoctor;  
        
    }

    function addDoctor(){
        
        loadDoctorData();
        
        const request = 
        new Request(backend+'/doctores', {method: 'POST', 
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify(doctor)});
 
        (async ()=>{
            try{
                const response = await fetch(request);
                cleanScreen();
                if (!response.ok) 
                {
                    errorMessage(response.status,$("#add-modal #errorDiv"));return;
                }
                await addImagen();
                reset();
                 document.location = url+"/presentation/Login.html";
                
                
            }
            catch(e){
                errorMessage(NET_ERR,$("#add-modal #errorDiv"));
            }        
        })();  
   
    }
    async function addImagen(){
        var imagenData = new FormData();
        imagenData.append("id", doctor.idDoctor);
        imagenData.append("imagen", $("#imagen").get(0).files[0]); 
        let request = new Request(backend+'/doctores/'+doctor.idDoctor+'/imagen', {method: 'POST',body: imagenData});
        const response = await fetch(request);     
        if (!response.ok) {errorMessage(response.status,$("#add-modal #errorDiv"));return;}              
    }
    function update(){
        retrieveSchedule();
        loadDoctorData();
        const request = new Request(backend+'/doctores/'+doctor.idDoctor, {method: 'PUT', headers: { 'Content-Type': 'application/json'},body: JSON.stringify(doctor)});
        (async ()=>{
            try{
                const response = await fetch(request);
                if (!response.ok) {errorMessage(response.status,$("#add-modal #errorDiv"));return;}
                reset();
            }
            catch(e){
                errorMessage(NET_ERR,$("#add-modal #errorDiv"));
            } 
        })(); 
    }
    
    function edit(id){
        const request = new Request(backend+'/doctores/'+id, {method: 'GET', headers: { }});
        (async ()=>{
            try{
                const response = await fetch(request);
                if (!response.ok) {errorMessage(response.status,$("#buscarDiv #errorDiv"));return;}
                doctor = await response.json();
                mode='E'; //editing
                render();
            }
            catch(e){
                errorMessage(NET_ERR,$("#buscarDiv #errorDiv"));
            }         
        })(); 
    }
    
    function createSchedule(){
    var schedule=document.getElementById("schedule-row");
    var html="";
    dias.forEach( (d,index)=>{html+=row(d,index);});
    schedule.innerHTML=html;    
  }  
  
    function row(d,index){

        ind = index;
        checked = "checked"+ind;
        element ="element"+ind;
        return `
            <div class="timeAndDay" >    
                <div class='schedule-col-header d-inline'>
                <input type="checkbox" id="${checked}" value="1" class="dayCheckBox" onchange="javascript:showContent(${ind})"  />
                <span class="dayName">
                ${d.nombre}
                </span></div>
                <div class='schedule-col-body' style="display: none;"  id="${element}">
                Desde:
                <select class="from" >
                    <option value=""></option>
                    <option value="08">08</option>
                    <option value="09">09</option>
                    <option value="10">10</option>
                    <option value="11">11</option>
                    <option value="12">12</option>
                    <option value="13">13</option>
                    <option value="14">14</option>
                    <option value="15">15</option>
                    <option value="16">16</option>
                    <option value="17">17</option>
                </select>
                <br>
                Hasta:
                <select class="to" >
                    <option value=""></option>
                    <option value="08">08</option>
                    <option value="09">09</option>
                    <option value="10">10</option>
                    <option value="11">11</option>
                    <option value="12">12</option>
                    <option value="13">13</option>
                    <option value="14">14</option>
                    <option value="15">15</option>
                    <option value="16">16</option>
                    <option value="17">17</option>
                </select>
                </div>
            </div>
        `;   
    }

    function retrieveSchedule()
    {
        //tomar los valores que hayan sido seleccionados
        $(".timeAndDay").each(function(index, element)
        {
            var day = $(element).find(".dayName").text().trim();
            var from = $(element).find(".from").val();
            var to = $(element).find(".to").val();
            
            if(from === "" && to === ""|| from === null && to === null )
            {
                var obj = {id:0, dia:day, seleccionado:0, desde:"0", hasta:"0"};
            }
            else
            {
                var obj = {id:0, dia:day, seleccionado:1, desde:from, hasta:to};
            }     
            horarios.push(obj);
        });
        $('#exampleModal').modal('hide'); 
    }

    function reset()
    {
        doctor = {idDoctor:"", nombre:"",costoConsulta:0, 
            frecuencia:0,especialidad:"", localidad:"", 
            presentacionDoctor:"",estadoDoctor:0, horarios:[]}; 
    }

    function makenew()
    {
      reset();
    }
    
    function showContent(index) 
    {
        
        element = "element"+index;
        checked = "checked"+index;
          
        Vcheck = document.getElementById(checked.toString());
        Velement = document.getElementById(element.toString());  
        
        if (Vcheck.checked) {
            Velement.style.display='block';
        }
        else {
            Velement.style.display='none';   
        }   
    }
    
    function loaded(){
        $("#registrar").on("click",addDoctor);
        $("#Save").on("click",retrieveSchedule);
        
        createSchedule();
        
        var json=localStorage.getItem("doctor");
        if (json)
        {
            doctor = JSON.parse(json);
            mode = 'E';
        }
        else 
        {
            mode = 'A';
        }
        render();
    }
  
    $(loaded);  


