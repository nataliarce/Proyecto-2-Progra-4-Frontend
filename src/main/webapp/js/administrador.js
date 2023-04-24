var doctor={idDoctor:"", nombre:"", estadoDoctor:0};
var  doctoresAprob = new Array();
var  doctoresSinAprob = new Array();
const NET_ERR=999;
var mode='E';
var backend="http://localhost:8080/Proyecto2_ExpedienteMedicoBackEnd/api";
var url ="http://localhost:8080/Proyecto2_ExpedienteMedico";



function reset()
{
    doctor={idDoctor:"", nombre:"", estadoDoctor:0};
}

function render()
{
    $("#idDoctor").val(doctor.idDoctor);
    $("#nombre").val(doctor.nombre);
    ($("#estadoDoctor").val(doctor.estadoDoctor));
    switch(mode)
    {
        case 'E':
            $("#idDoctor").prop("readonly", true );
            $("#nombre").prop("readonly", true );
            $('#aplicar').off('click').on('click', update);
            break;      
    }
    $('#add-modal').modal('show'); 
}

function update(){
    load();
    const request = new Request(backend+'/doctores/'+doctor.idDoctor, 
        {method: 'PUT', headers: { 'Content-Type': 'application/json'},
            body: JSON.stringify(doctor)});
    (async ()=>{
        try{
            const response = await fetch(request);
            if (!response.ok) {errorMessage(response.status,$("#add-modal #errorDiv"));return;}
            fetchAndList();
            fetchAndListAprobados();
            reset();
            $('#add-modal').modal('hide');
        }
        catch(e){
            errorMessage(NET_ERR,$("#add-modal #errorDiv"));
        } 
    })();     
  }

function load()
{
    doctor = Object.fromEntries( (new FormData($('#formulario').get(0))).entries());
}

function list()
{
    $("#listadoSinAprobar").html("");
    doctoresSinAprob.forEach( (d)=>{row($("#listadoSinAprobar"),d);});	
}  

function row(listado,doctor){
    var tr =$("<tr />");
    tr.html(`<td>${doctor.idDoctor}</td>
             <td>${doctor.nombre}</td>
             <td>${doctor.estadoDoctor}</td>       
             <td id='edit' ><img src='../images/edit.png'</td>`);
    tr.find("#edit").on("click",()=>{edit(doctor.idDoctor);});
    listado.append(tr);           
}

function edit(idDoctor){
    const request = new Request(backend+'/doctores/'+idDoctor, {method: 'GET', headers: { }});
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
    


function fetchAndList(){
    const request = new Request(backend+'/doctores'+'/sinAprobar', {method: 'GET', headers: { }});
    (async ()=>{
        try{
            const response = await fetch(request);
            if (!response.ok) {errorMessage(response.status,$("#buscarDiv #errorDiv"));return;}
            doctoresSinAprob = await response.json();
            list();
        }
        catch(e){
            errorMessage(NET_ERR,$("#buscarDiv #errorDiv"));
        }         
    })();    
  } 
  
//  APROBADOS  
function fetchAndListAprobados(){
    const request = new Request(backend+'/doctores'+'/aprobados', {method: 'GET', headers: { }});
    (async ()=>{
        try{
            const response = await fetch(request);
            if (!response.ok) {errorMessage(response.status,$("#buscarDiv #errorDiv"));return;}
            doctoresAprob = await response.json();
            listAprobados();
        }
        catch(e){
            errorMessage(NET_ERR,$("#buscarDiv #errorDiv"));
        }         
    })();    
  } 

function listAprobados()
{
    $("#listadoAprobado").html("");
    doctoresAprob.forEach( (d)=>{rowAprobados($("#listadoAprobado"),d);});	
}  

function rowAprobados(listado,doctor){
    var tr =$("<tr />");
    tr.html(`<td>${doctor.idDoctor}</td>
             <td>${doctor.nombre}</td>
             <td>${doctor.estadoDoctor}</td>`);      
    listado.append(tr);           
}

function logOut()
{
    localStorage.removeItem("usuario");
    document.location = url+"/presentation/Login.html";
}

function loaded(){
    $("#regresar").click(logOut);
    fetchAndList();
    fetchAndListAprobados();
  }
  
  $(loaded);  
