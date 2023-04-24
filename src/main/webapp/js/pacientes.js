  var  pacientes = new Array();
  var paciente={idPaciente:0, nombrePaciente:"",edadPaciente:0,celularPaciente:0,
                emailPaciente:"", idDoctor:"",contactoEmergenciaPaciente:0};
  var enfermedades = new Array();
  var enfermedad={idEnfermedades:0,cardiovascular:0,cancer:0,diabetes:0,asma:0};
  var antecedesntes = new Array();
  var antecedente={idEnfermedades:0,idPaciente:0,alergias:0,cirugias:0};
  var cita={idCita:0,motivo:"",estado:0, fechaConsulta:"",idDoctor:"",resultado:0,idPaciente:0};
      
  var mode='A'; //adding
  var backend="http://localhost:8080/Proyecto2_ExpedienteMedicoBackEnd/api";
  const NET_ERR=999;

    function render(){
        $("#idPaciente").val(paciente.idPaciente);
	$("#nombrePaciente").val(paciente.nombrePaciente);
        $("#edadPaciente").val(paciente.edadPaciente);
        $("#celularPaciente").val(paciente.celularPaciente);
        $("#emailPaciente").val(paciente.emailPaciente);
        $("#contactoEmergenciaPaciente").val(paciente.contactoEmergenciaPaciente);
        
        $("input[name='cardiovascular']").val([enfermedad.cardiovascular]);
        $("input[name='cancer']").val([enfermedad.cancer]);
        $("input[name='diabetes']").val([enfermedad.diabetes]);
        $("input[name='asma']").val([enfermedad.asma]);
        
        $("input[name='alergias']").val([antecedente.alergias]);
        $("input[name='cirugias']").val([antecedente.cirugias]);
        switch(mode){
            case 'A':
                $("#idPaciente").prop( "readonly", false );
                $('#aplicar').off('click').on('click',addEnfermedad);
                break;
            case 'E':
                $("#idPaciente").prop("readonly", true );
                $('#aplicar').off('click').on('click', update);
                break;             
        }
        $('#add-modal').modal('show');        
    }
    function loadEnfermedad(){
        let cardiovascular = document.querySelector('input[name="cardiovascular"]:checked').value;
        let cancer = document.querySelector('input[name="cancer"]:checked').value;
        let diabetes = document.querySelector('input[name="diabetes"]:checked').value;
        let asma = document.querySelector('input[name="asma"]:checked').value;
        
        enfermedad.cardiovascular = cardiovascular;
        enfermedad.cancer = cancer;
        enfermedad.diabetes = diabetes;
        enfermedad.asma = asma;
    }
    function loadAntecedentes(enfermedad){
        let alergias = document.querySelector('input[name="alergias"]:checked').value;
        let cirugias = document.querySelector('input[name="cirugias"]:checked').value;
        
        
        antecedente.idEnfermedades = enfermedad.idEnfermedades;
        antecedente.idPaciente=paciente.idPaciente;
        antecedente.alergias=alergias;
        antecedente.cirugias=cirugias;
    }
    function loadPaciente(){
        paciente = Object.fromEntries( (new FormData($("#formulario").get(0))).entries());
        let user = JSON.parse(localStorage.getItem("usuario"));
        let idDoctor = user.idUsuario;
        paciente.idDoctor = idDoctor;
    }
    
    function loadCita()
    {
        let user = JSON.parse(localStorage.getItem("usuario"));
        let idDoctor = user.idUsuario;
        
        let userP = JSON.parse(localStorage.getItem("idPaciente"));
        
        
        let motivo = document.getElementsByName("motivo")[0].value;
        let fechaConsulta = document.getElementsByName("evtStart")[0].value;
        
        
        cita.motivo = motivo;
        cita.fechaConsulta = fechaConsulta;
        cita.idDoctor = idDoctor;
        cita.idPaciente = userP;
        cita.idCita = 0;
    }
    
    function reset(){
        paciente={idPaciente:"", nombrePaciente:"",edadPaciente:"",celularPaciente:"",
                emailPaciente:"", contactoEmergenciaPaciente:""}; 
        enfermedad={cardiovascular:0,cancer:0,diabetes:0,asma:0};
        antecedente={idPaciente:"",alergias:0,cirugias:0};
        
    }    
    
    function resetCita()
    {

        $("#motivo").val("");
        $("#evtStart").val("");
        $("#paciente").val("");
        
        
    }
    
    function addEnfermedad(){
        loadEnfermedad();
        const request = new Request(backend+'/enfermedades', 
                {method: 'POST', 
                    headers: { 'Content-Type': 'application/json'},
                    body: JSON.stringify(enfermedad)});
        (async ()=>{
            try{
                const response = await fetch(request);
                if (!response.ok) {errorMessage(response.status,$("#add-modal #errorDiv"));return;}
                await addPaciente();
//                await addAntecedente();
                getDoctorByUserId();
                reset();
                $('#add-modal').modal('hide'); 
            }
            catch(e){
                errorMessage(NET_ERR,$("#add-modal #errorDiv"));
            }        
        })();    
    } 

    async function addAntecedentes(){
        enfermedades.forEach( (e)=>{loadAntecedentes(e);});
        const request = new Request(backend+'/antecedentes', 
                {method: 'POST', 
                    headers: { 'Content-Type': 'application/json'},
                    body: JSON.stringify(antecedente)});
        (async ()=>{
            try{
                const response = await fetch(request);
                if (!response.ok) {errorMessage(response.status,$("#add-modal #errorDiv"));return;}
                //reset(); 
            }
            catch(e){
                errorMessage(NET_ERR,$("#add-modal #errorDiv"));
            }        
        })();    
    }
   
    async function addPaciente(){
        loadPaciente();
        const request = new Request(backend+'/pacientes', 
                {method: 'POST', 
                    headers: { 'Content-Type': 'application/json'},
                    body: JSON.stringify(paciente)});
        (async ()=>{
            try{
                const response = await fetch(request);
                if (!response.ok) {errorMessage(response.status,$("#add-modal #errorDiv"));return;}
                //await addAntecedentes();
//                getDoctorByUserId();
//                reset();
//                $('#add-modal').modal('hide');  
            }
            catch(e){
                errorMessage(NET_ERR,$("#add-modal #errorDiv"));
            }        
        })();    
    } 
 
    function update(){
        loadPaciente();
        const request = new Request(backend+'/pacientes/'+paciente.idPaciente, 
            {method: 'PUT', headers: { 'Content-Type': 'application/json'},
                body: JSON.stringify(paciente)});
        (async ()=>{
            try{
                const response = await fetch(request);
                if (!response.ok) {errorMessage(response.status,$("#add-modal #errorDiv"));return;}
                getDoctorByUserId();
                reset();
                $('#add-modal').modal('hide');
            }
            catch(e){
                errorMessage(NET_ERR,$("#add-modal #errorDiv"));
            } 
        })();     
    }

    function list(pacientes){
        $("#listado").html("");
        pacientes.forEach( (p)=>{row($("#listado"),p);});	
    }  
  
    function row(listado,paciente){
	var tr =$("<tr />");
	tr.html(`<td>${paciente.idPaciente}</td>
                 <td>${paciente.nombrePaciente}</td>
                 <td id='edit'><img src='../images/edit.png'></td>
                 <td id= 'examenes'><button type="button" class="btn btn-primary ml-3" id="examenes">Examenes</button></td>
                 <td id= 'historial'><button type="button" class="btn btn-primary ml-3" id="historial">Historial</button></td>
                 <td id= 'addCita'><button type="button" class="btn btn-primary ml-3" id="addCita">Añadir cita</button></td>`);
        tr.find("#edit").on("click",()=>{edit(paciente.idPaciente);});
        tr.find("#examenes").on("click",()=>{examenesPaciente(paciente.idPaciente);});
        tr.find("#historial").on("click",()=>{historialPaciente(paciente.idPaciente);});
        tr.find("#addCita").on("click",()=>{renderCita(paciente);});
	listado.append(tr);           
    }
  
    function edit(idPaciente){
        const request = new Request(backend+'/pacientes/'+idPaciente, {method: 'GET', headers: { }});
        (async ()=>{
            try{
                const response = await fetch(request);
                if (!response.ok) {errorMessage(response.status,$("#buscarDiv #errorDiv"));return;}
                paciente = await response.json();
                mode='E'; //editing
                render();
            }
            catch(e){
                errorMessage(NET_ERR,$("#buscarDiv #errorDiv"));
            }         
        })();      
    }
    
    function addCita(){
        
        loadCita();    
        
        const request = new Request(backend+'/agenda', 
            {method: 'POST', headers: { 'Content-Type': 'application/json'},
                body: JSON.stringify(cita)});
        (async ()=>{
            try{
                const response = await fetch(request);
                
                if (!response.ok) {errorMessage(response.status,$("#add-modal #errorDiv"));return;}
                resetCita();
                $('#event-modal').modal('hide');
            }
            catch(e){
                errorMessage(NET_ERR,$("#add-modal #errorDiv"));
            } 
        })();   
    }
    
    function renderCita(paciente)
    {
        localStorage.setItem("idPaciente",JSON.stringify(paciente.idPaciente));
        $("#paciente").val(paciente.nombrePaciente);
        $("#paciente").prop("readonly", true );
        $('#submit').off('click').on('click', addCita);
        $('#event-modal').modal('show');
        
    }
    function historialPaciente(idPaciente){
      localStorage.setItem("idPaciente",JSON.stringify(idPaciente));
      document.location = "http://localhost:8080/Proyecto2_ExpedienteMedico/presentation/ViewHistorial.html";
    }
    function examenesPaciente(idPaciente){
      localStorage.setItem("idPaciente",JSON.stringify(idPaciente));
      document.location = "http://localhost:8080/Proyecto2_ExpedienteMedico/presentation/ViewExamenesPaciente.html";
    }
  
  function makenew(){
      reset();
      mode='A'; //adding
      render();
    }
 
  function errorMessage(status,place){  
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
 

    function getDoctorByUserId()
    {
    let user = JSON.parse(localStorage.getItem("usuario"));
    let idDoctor = user.idUsuario;
    
    const request = new Request(backend+'/doctores/'+idDoctor, 
    {method: 'GET', headers: {}});
        (async()=> 
        {
            try 
            {
                const response = await fetch(request);
                if (!response.ok) 
                {
                    return;
                } 
                
                let doctor = await response.json();
                list(doctor.pacientes);
                return doctor;
            }
            catch (e)
            {
                alert(e);
            }
        })();  
    }
  
  function loaded(){
    getDoctorByUserId();
    loadMenu($("#menucontainer"));
    $("#crear").click(makenew);     
  }
  
  $(loaded);  


