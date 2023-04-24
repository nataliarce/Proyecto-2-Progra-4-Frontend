var backend = "http://localhost:8080/Proyecto2_ExpedienteMedicoBackEnd/api";
var url ="http://localhost:8080/Proyecto2_ExpedienteMedico";

    function logOut()
{
    localStorage.removeItem("usuario");
    localStorage.removeItem("doctor");
    localStorage.removeItem("idCita");
    localStorage.removeItem("idPaciente");
    document.location = url+"/presentation/Login.html";
}

function loadMenu(container){
    let user = JSON.parse(localStorage.getItem("usuario"));
    let idDoctor = user.idUsuario;
    

    
    const request = new Request(backend+'/doctores/'+idDoctor, 
    {method: 'GET', headers: {},});
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
                container.html(
            `<div class="menu">
                <div class="menu-item">
                    <div> <b>Dr. ${doctor.nombre}</b></div>
                <div> <img id="image" width="50" height="50" class="image-mini-icon rounded-circle" src="${backend}/doctores/${doctor.idDoctor}/image"></div>
                </div>
                <br>
                <br>
                <h4 class="menu-item" id="menu_agenda"><i class="fa fa-calendar-alt"></i></h4>
                <br>
                <br>
                <h4 class="menu-item" id="menu_pacientes"><i class="fa fa-address-card"></i></h4>
                <br>
                <br>
                <h4 class="menu-item" id="menu_doctor"><i class="fa fa-user-md"></i></h4>
                <br>
                <br>
                <h4 class="menu-item" id="menu_logout"><i class="fa fa-sign-out-alt"></i></h4>
            </div>`);
    $("#menu_agenda").on("click", e=>{document.location = "http://localhost:8080/Proyecto2_ExpedienteMedico/presentation/Agenda.html";});
    $("#menu_pacientes").on("click", e=>{document.location = "http://localhost:8080/Proyecto2_ExpedienteMedico/presentation/ViewPacientes.html";});
    $("#menu_doctor").on("click", e=>{document.location = "http://localhost:8080/Proyecto2_ExpedienteMedico/presentation/Registro.html";});
    $("#menu_logout").on("click", logOut);

            }
            catch (e)
            {
                alert(e);
            }
        })();  
    
}

