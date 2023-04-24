var backend="http://localhost:8080/Proyecto2_ExpedienteMedicoBackEnd/api";
var cita={idCita:0, motivo:"",estado:0,idPaciente:"", idDoctor:"",resultado};
var resultado={idResultado:"",signos:"",diagnostico:"",prescripciones:""};
//var pacientes = ["mich", "bev", "nat"];

document.addEventListener('DOMContentLoaded', function() 
{
    var doctor = getDoctorByUserId();
    globalThis.doctor = JSON.parse(localStorage.getItem("doctor"));
    globalThis.schedule = getDoctorsScheduleDays();
    //getWeeklyAppointments(currentWeek);
    globalThis.days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday'];
    var calendarEl = document.getElementById('calendar');
    var calendar = new FullCalendar.Calendar(calendarEl, 
    {
        initialView: 'timeGridWeek',
        selectable: true,
        selectHelper: true,
        slotDuration: getAppointmentFrequency(),
        businessHours: findBusinessHours(),
        //events: filterWeeklyAppointments(),
    select: function(arg) 
    { 
        var date = new Date(arg.start);
        var day = convertNumberToDay(date.getDay())
        if(globalThis.schedule.includes(day))
        {
            // set values in inputs
            $('#event-modal').find('input[name=evtStart]').val(arg.start);
            $('#event-modal').find('input[name=evtEnd]').val(arg.end);
            // show modal dialog
            $('#event-modal').modal('show');
            //funcion para agregar cita
            $('#submit').on('click', function() 
            {
                (async()=> {

                    var paciente = globalThis.doctor.pacientes.find(element => 
                                element.nombrePaciente === 
                                        $("#cuerpoDeModal").find('select[name=paciente]').val());

                    var stringFecha = arg.start;
                    var fechaConsulta = convertDate(stringFecha);
                    var cita =
                    {
                        idCita: 0,
                        motivo: $("#cuerpoDeModal").find('input[name=motivo]').val(),
                        estado: 0,
                        fechaConsulta: fechaConsulta,
                        idPaciente: paciente.idPaciente,
                        idDoctor: globalThis.doctor.idDoctor,
                        idResultado:0        
                    };

                    try
                    {
                        await saveAppointment(cita);

                        calendar.addEvent
                        ({
                            start: arg.start,                          
                            title: $("#cuerpoDeModal").find('select[name=paciente]').val()
                        });
                    }
                    catch(e)
                    {
                        alert(e);
                    }
                    $("#cuerpoDeModal").find('input[name=motivo]').val("");
                    $("#cuerpoDeModal").find('select[name=paciente]').val("");
                    $('#event-modal').modal('hide');
                })();
            });   
        }  
    },    
    eventClick: 
    function(arg) 
    {
        var cita = globalThis.appointments.find(element => 
                               element.fechaConsulta === convertDate2(arg.event.start));
        ($('#atenderCita').modal('show'));
        
        localStorage.setItem("idCita",cita.idCita);
        localStorage.setItem("arg.event",arg.event);
        $('#aplicar').off('click').on('click', crearResultado);
        $('#borrar').off('click').on('click',function eliminar()
        {
            
            removeAppointment(arg.event);
            arg.event.remove();
              
        });
        
    }
//            function(arg) 
//    {
////        $('#event-modal').modal('show');
//        if (confirm('Desea borrar el evento?')) 
//        {
//            //var date = arg.event.start;
//            
//            var idCita = globalThis.appointments.find(element => 
//                                element.fechaConsulta === convertDate2(arg.event.start))
//            removeAppointment(arg.event);
//            arg.event.remove()
//        }
//    }
    });
    calendar.render(); 
    (async()=> {
        var appointments = await getAllAppointments();
        for(let appointment of appointments)
        {
            calendar.addEvent
            ({
                start: appointment.start,
                title: appointment.title
            });      
        }   
    })();
    
    //calendar.events = getAllAppointments();
    console.log("buenas");
});



//-----------------------------REQUESTS-----------------------------

function crearResultado()
{
load();
let idCita = localStorage.getItem("idCita");
const request = new Request(backend+'/citas/'+idCita, 
    {method: 'POST', headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify(resultado)});
(async ()=>{
    try{
        const response = await fetch(request);
        cleanScreen();
        if (!response.ok) {errorMessage(response.status,$("#add-modal #errorDiv"));return;}
        reset();
        localStorage.removeItem("idCita");
        $('#atenderCita').modal('hide');
    }
    catch(e){
        errorMessage(NET_ERR,$("#add-modal #errorDiv"));
    } 
})();   
}

async function saveAppointment(appointment)
{
    const request = 
        new Request(backend+'/agenda', {method: 'POST', 
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify(appointment)});
    
    try
    {
        const response = await fetch(request);
    
        if (!response.ok)
        {
            errorMessage(response.status,$("#add-modal #errorDiv"));return;
        }
    }
    catch(e)
    {
        errorMessage(NET_ERR,$("#add-modal #errorDiv"));
    } 

    // 1) puedo usar await en otras funciones async --- await fetch
    // 2) otras funciones async me pueden hacer await --- desdes afuera await saveAppointment
    
    // await fetch (llamada del backend)
    // await json  
}   

function getDoctorByUserId()
{
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
                
                var doctor = await response.json();
                localStorage.setItem("doctor",JSON.stringify(doctor));
                loadPacientList(doctor.pacientes);
                return doctor;
            }
            catch (e)
            {
                alert(e);
            }
        })();  
}

function removeAppointment(event)
{
    let eventDate = event.start;
    let appointmentDate = convertDate2(eventDate);
    
    var date = globalThis.appointments.find(element => 
                                element.fechaConsulta === appointmentDate);
                                
    var idCita = date.idCita;                            
    
    const request = new Request(backend+'/agenda/'+idCita, 
        {method: 'DELETE', headers: {},});
        (async()=> 
        {
            try 
            {
                const response = await fetch(request);
                if (!response.ok) 
                {
                    return;
                } 
            }
            catch (e)
            {
                alert(e);
            }
        })();  
}

async function getAllAppointments()
{
    let idDoctor = globalThis.doctor.idDoctor;
  
    const request = new Request(backend+'/agenda/'+idDoctor, 
        {method: 'GET', headers: {},});
        try 
        {
            const response = await fetch(request);
            if (!response.ok) 
            {
                return;
            } 

            var appointments = await response.json();
            globalThis.appointments = appointments;
            var events = filterWeeklyAppointments(appointments);
            return events;
        }
        catch (e)
        {
            alert(e);
        }      
}

function filterWeeklyAppointments(appointmentList)
{
    //var date = convertCurrentWeekDay(week);
    var filteredAppointmentList = [];
    var week = [];
    for (let index = 0; index < 7; ++index)
    {
        var day = 
                document.getElementsByClassName('fc-col-header-cell-cushion')[index].innerText;
        var date2 = convertCurrentWeekDay(day);
        week.push(date2);
    }
    
    for(var appointment of appointmentList)
    {
        var prueba = appointment.fechaConsulta.substring(0,10);
        if(week.includes(appointment.fechaConsulta.substring(0,10)))
        {
            
            var paciente = globalThis.doctor.pacientes.find(element => 
                                element.idPaciente.toString() === appointment.idPaciente);
            var nombrePaciente = paciente.nombrePaciente;
            var event = {
                start: appointment.fechaConsulta,
                title: nombrePaciente
            };
            filteredAppointmentList.push(event);
        }
    }
    return filteredAppointmentList;  
}

//-----------------------------FUNCIONES AUXILIARES-----------------------------

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

function loadPacientList(pacientes)
{
    var select = document.getElementById('paciente');
    var fragment = document.createDocumentFragment();
    pacientes.forEach(function(paciente, index) {
        var opt = document.createElement('option');
        opt.innerHTML = paciente.nombrePaciente;
        opt.value = paciente.nombrePaciente;
        fragment.appendChild(opt);
        select.appendChild(fragment);
    });
}

function convertDate(str) {
    var date = new Date(str),
        mnth = ("0" + (date.getMonth()+1)).slice(-2),
        day  = ("0" + date.getDate()).slice(-2);
        hours  = ("0" + date.getHours()).slice(-2);
        minutes = ("0" + date.getMinutes()).slice(-2);
    //return [ date.getFullYear(), mnth, day, hours, minutes ].join("-");
    return date.getFullYear()+"-"+mnth+"-"+day+"T"+hours+":"+minutes;
}

function convertDate2(str) {
    var date = new Date(str),
        mnth = ("0" + (date.getMonth()+1)).slice(-2),
        day  = ("0" + date.getDate()).slice(-2);
        hours  = ("0" + date.getHours()).slice(-2);
        minutes = ("0" + date.getMinutes()).slice(-2);
    //return [ date.getFullYear(), mnth, day, hours, minutes ].join("-");
    return date.getFullYear()+"-"+mnth+"-"+day+"T"+hours+":"+minutes+":00";
}

function convertCurrentWeekDay(str) {
    var date = new Date(str),
        mnth = ("0" + (date.getMonth()+1)).slice(-2),
        day  = ("0" + date.getDate()).slice(-2);
    return "2022"+"-"+mnth+"-"+day;
    //return [date.getFullYear(), mnth, day].join("-"); 
}

function getAppointmentFrequency()
{
    let appointmentFrequency = globalThis.doctor.frecuencia;
    if(appointmentFrequency === 60)
    {
        return '01:00';
    }
    else
    {
        return '00:30';
    }
}

//function findStartTime()
//{
//    let schedule = globalThis.doctor.horarios;
//    let minStartTime = schedule.forEach(element => {
//        let minValue = '20';
//        if(minValue > element.desde)
//        {
//            minValue = element.desde;
//        }
//    });
//    return minStartTime;
//}

//function findStartTime()
//{
//    let schedule = globalThis.doctor.horarios;
//    let minStartTime = '20';
//    for (let element of schedule) 
//    { 
//        if(parseInt(minStartTime) > parseInt(element.desde))
//        {
//            minStartTime = element.desde;
//        }
//    }
//    return "0"+minStartTime+":00:00";
//}

function convertDayToNumber(day)
{
    let days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday'];
    for (let index = 0; index < days.length; ++index)
    {
        if(day === days[index])
        {
            return index;
        }
    }
}

function convertNumberToDay(number)
{
    let days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday'];
    return days[number];
}

function findBusinessHours()
{
    let schedule = globalThis.doctor.horarios;
    let businessHours = [];
    for (let element of schedule) 
    { 
        let obj = {
            daysOfWeek: [convertDayToNumber(element.dia)],
            startTime: element.desde+":00",
            endTime: element.hasta+":00"
        };
        businessHours.push(obj);
    }
    return businessHours;
}

function getDoctorsScheduleDays()
{
    let schedule = globalThis.doctor.horarios;
    let scheduleDays = [];
    for (let element of schedule) 
    {
        scheduleDays.push(element.dia);
    }
    return scheduleDays;
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

function cleanScreen()
{
    $("#signos").val("");
    $("#diagnosticos").val("");
    $("#prescripciones").val("");
}

function reset()
{
    cita={idCita:0, motivo:"",estado:0,idPaciente:"", idDoctor:""};
    resultado={idResultado:0,signos:"",diagnosticos:"",prescripciones:""};
}

