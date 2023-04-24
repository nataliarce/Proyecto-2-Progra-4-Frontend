var citas=new Array();
var cita={idCita:0, motivo:"",estado:0,idPaciente:"", idDoctor:"",resultado};
var resultado={idResultado:"",signos:"",diagnostico:"",prescripciones:""};
var backend="http://localhost:8080/Proyecto2_ExpedienteMedicoBackEnd/api";
const NET_ERR=999;
  

    function reset()
    {
        cita={idCita:0, motivo:"",estado:0,idPaciente:"", idDoctor:""};
        resultado={idResultado:0,signos:"",diagnosticos:"",prescripciones:""};
    }
    
    function cleanScreen()
    {
        $("#signos").val("");
        $("#diagnosticos").val("");
        $("#prescripciones").val("");
    }

    function render()
    {
        $("#signos").val(resultado.signos);
        $("#diagnosticos").val(resultado.diagnostico);
        $("#prescripciones").val(resultado.prescripciones);
        switch(mode)
        {
            case 'A':
                $('#aplicar').off('click').on('click', crearResultado);
                break;      
        }
        $('#add-modal').modal('show'); 
    }


     function crearResultado()
     {
        load();
        const request = new Request(backend+'/citas/'+cita.idCita, 
            {method: 'POST', headers: { 'Content-Type': 'application/json'},
                body: JSON.stringify(resultado)});
        (async ()=>{
            try{
                const response = await fetch(request);
                cleanScreen();
                if (!response.ok) {errorMessage(response.status,$("#add-modal #errorDiv"));return;}
                fetchAndListCitasPorPaciente();
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
        //resultado = Object.fromEntries( (new FormData($('#formulario').get(0))).entries());
        let signos = document.getElementsByName("signos")[0].value;
        let diagnosticos = document.getElementsByName("diagnosticos")[0].value;
        let prescripciones = document.getElementsByName("prescripciones")[0].value;
        
        resultado.idResultado = 0;
        resultado.signos = signos;
        resultado.diagnosticos  = diagnosticos;
        resultado.prescripciones = prescripciones;
     }

    function listCitas()
    {
        $("#listado").html("");
        citas.forEach( (c)=>{row($("#listado"),c);});
    } 


    function row(listado,cita)
    {
            if(cita.estado === 0){
                rowPendientes(listado,cita);
            }else{
                rowRealizadas(listado,cita);
            } 
    }

    function rowRealizadas(listado,cita)
    {
        var tr =$("<tr />");
            tr.html(`<td>${cita.idPaciente}</td>
                     <td>${cita.idDoctor}</td>
                     <td>${cita.idCita}</td>
                     <td>${cita.motivo}</td>
                     <td> Realizada</td>`);
            listado.append(tr);
    }

    function rowPendientes(listado,cita)
    {
        var tr =$("<tr />");
            tr.html(`<td>${cita.idPaciente}</td>
                     <td>${cita.idDoctor}</td>
                     <td>${cita.idCita}</td>
                     <td>${cita.motivo}</td>
                     <td id= 'accept'><button type="button" class="btn btn-primary ml-3" id="accept">Atender cita</button></td>`);
            tr.find("#accept").on("click",()=>{edit(cita.idCita);});
            listado.append(tr);
    }

    function edit (idCita)
    {
        const request = new Request (backend+'/citas/'+idCita,{method: 'GET', headers: { }});
        (async ()=>{
            try{
                const response = await fetch(request);
                if (!response.ok) {errorMessage(response.status,$("#buscarDiv #errorDiv"));return;}
                cita = await response.json();
                mode='A'; //editing
                render();
            }
            catch(e){
                errorMessage(NET_ERR,$("#buscarDiv #errorDiv"));
            }         
        })();   
    }
    
    function fetchAndListCitasPorPaciente(){
        let idPaciente = JSON.parse(localStorage.getItem("idPaciente"));
        const request = new Request(backend+'/citas/'+idPaciente+'/paciente', {method: 'GET', headers: { }});
        (async ()=>{
            try{
                const response = await fetch(request);
                if (!response.ok) {errorMessage(response.status,$("#buscarDiv #errorDiv"));return;}
                citas = await response.json();
                listCitas();
            }
            catch(e){
                errorMessage(NET_ERR,$("#buscarDiv #errorDiv"));
            }         
        })();    
    }

    function loaded(){
        fetchAndListCitasPorPaciente();
        loadMenu($("#menucontainer"));
    }
  
  $(loaded); 
  
  


