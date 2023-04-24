var examenes = new Array();
var examen = {idExamen:0,descripcion:"",fecha:"",idPaciente:0,idCita:0};
var backend="http://localhost:8080/Proyecto2_ExpedienteMedicoBackEnd/api";
var mode='A'; //adding
const NET_ERR=999;
    function render(){
        $("#descripcion").val(examen.descripcion);
	$("#fecha").val(examen.fecha);
        $("#idCita").val(examen.idCita);
        switch(mode){
            case 'A':
                $('#aplicar').off('click').on('click',addExamen);
                break;             
        }
        $('#add-modal').modal('show');        
    }
  
    function loadExamen(){
        examen = Object.fromEntries( (new FormData($("#formulario").get(0))).entries());
        let idPaciente = JSON.parse(localStorage.getItem("idPaciente"));
        str=JSON.stringify(idPaciente);
        examen.idPaciente = str;
    }
    function reset(){
        examen = {idExamen:"",descripcion:"",fecha:"",idPaciente:"",idCita:""}; 
    } 
    function cleanScreen()
    {
        $("#descripcion").val("");
        $("#fecha").val("");
        $("#idCita").val("");
    }
    function addExamen(){
        loadExamen();
        const request = new Request(backend+'/examenes',{method: 'POST', 
            headers: { 'Content-Type': 'application/json'},body: JSON.stringify(examen)});
        (async ()=>{
            try{
                const response = await fetch(request);
                cleanScreen();
                if (!response.ok) {errorMessage(response.status,$("#add-modal #errorDiv"));return;}
                //examenes.forEach( (e)=>{addPDF(e);});
                await addPDF();
                fetchAndListExamenesPorPaciente();
                reset();
                $('#add-modal').modal('hide'); 
            }
            catch(e){
                errorMessage(NET_ERR,$("#add-modal #errorDiv"));
            }        
        })();    
    } 
    function listExamenes(){
        $("#listado").html("");
        examenes.forEach( (e)=>{row($("#listado"),e);});
    } 
  
    function row(listado,examen){
        var tr =$("<tr />");
            tr.html(`<td id='pdf'><img src='../images/pdf.png' class='icon'></td> 
                    <td>${examen.descripcion}</td>
                     <td>${examen.fecha}</td>`);
        tr.find("#pdf").on("click",()=>{abrirPDF(examen.idCita);});
        listado.append(tr);
    }
    function abrirPDF(id){

        var doc=document.getElementById("downloadPDF");
        var html=`<iframe src='${backend}/examenes/${id}.pdf' style="width:100%; height:100%; border:none;"></iframe>`;

        doc.innerHTML=html; 
        listExamenes();
   }

    function fetchAndListExamenesPorPaciente(){
        let idPaciente = JSON.parse(localStorage.getItem("idPaciente"));
        const request = new Request(backend+'/examenes/'+idPaciente+'/paciente', {method: 'GET', headers: { }});
        (async ()=>{
            try{
                const response = await fetch(request);
                if (!response.ok) {errorMessage(response.status,$("#buscarDiv #errorDiv"));return;}
                examenes = await response.json();
                listExamenes();
            }
            catch(e){
                errorMessage(NET_ERR,$("#buscarDiv #errorDiv"));
            }         
        })();    
    }
    async function addPDF(){
        var pdfData = new FormData();
        pdfData.append("id",examen.idCita);
        pdfData.append("pdf", $("#docPDF").get(0).files[0]); 
        let request = new Request(backend+'/examenes/'+examen.idCita+'/pdf', {method: 'POST',body: pdfData});
        const response = await fetch(request);     
        if (!response.ok) {errorMessage(response.status,$("#add-modal #errorDiv"));return;}              
    }
    function makenew(){
      reset();
      mode='A'; //adding
      render();
    }
    function loaded(){
        fetchAndListExamenesPorPaciente();
        loadMenu($("#menucontainer"));
        $("#crear").click(makenew);
    }
  
  $(loaded);


