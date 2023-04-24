var id="";
var backend="http://localhost:8080/Proyecto2_ExpedienteMedicoBackEnd/api";
const NET_ERR=999;
var url ="http://localhost:8080/Proyecto2_ExpedienteMedico";
const formularioUI = document.querySelector('#loginForm');
doctor = {estadoDoctor:0};

    function login()
    {
        usuario = {idUsuario: $("#idDoctorFld").val(), 
                  contrasena: $("#contrasenaFld").val(),
                  tipo: ""};
              
        const request = new Request(backend+'/usuarios', {method: 'GET', headers: {}});
        (async()=> 
        {
            try 
            {
                const response = await fetch(request);
                if (!response.ok) 
                {
                    console.log("Error al recuperar usuarios"); 
                    return;
                } 
                usuarios = await response.json();
                
                usuario = usuarios.find(u=>u.idUsuario===usuario.idUsuario && 
                        u.contrasena===usuario.contrasena);
                
                if (usuario.tipo==='Admin')
                {
                    localStorage.setItem("usuario",JSON.stringify(usuario));
                    console.log(usuario); 
                    document.location = url+"/presentation/Administrador.html"; 
                }
                else 
                {
                    if (usuario.tipo==='Doctor')
                    {
                        verificarEstado(usuario);  
                    }
                    else 
                    {
                        throw new Error("Usuario Invalido");
                    }
                }
            }
            catch (e)
            {
                alert(e);
            }
        })();          
    }
    
    function loginValidar()
    {
        $("#loginForm").addClass("was-validated");
        return $("#loginForm").get(0).checkValidity();
    }
    
   
    function cleanScreen()
    {
        $("#idDoctorFld").val("");
        $("#contrasenaFld").val("");

    }
    
    async function verificarEstado(usuario)
    {
              
        idDoctor = usuario.idUsuario;
        
        const request = new Request(backend+'/doctores/'+idDoctor+'/estado', {method: 'GET', headers: {}});
        const response = await fetch(request);
        if (!response.ok) 
        {
            console.log("Error al recuperar usuarios"); 
            return;
        } 
        
        estadoDoctor = await response.json();
        
        if (estadoDoctor===1)
        {
            localStorage.setItem("usuario",JSON.stringify(usuario));
            console.log(usuario); 
            document.location = url+"/presentation/Agenda.html";
        }
        else 
        {
            return
            throw new Error("El administrador tiene que aprobarlo para poder realizar login");
        }
    }
 
    
    function principal(){
      
      login();
      cleanScreen();
      
    }
    
     function registrar()
    {
        localStorage.removeItem("usuario");
        document.location = url+"/presentation/Registro.html";
    }
    
    function loaded(){
       
        $("#login").click(principal);
        $("#registrar").click(registrar);
    }
 
 
    $(loaded);  


