document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("calc-form");
    const pesoTotalInput = document.getElementById("peso-total");
    const pesoBarraInput = document.getElementById("peso-barra");
    const btnCalcular = document.getElementById("btn-calcular");
    const discosDiv = document.getElementById("discos");
    const errorMensaje = document.getElementById("errorMensaje");

    const btnDisponibilidad = document.getElementById("btn-disponibilidad");
    const dialogo = document.getElementById("dialogo-disponibilidad");
    const cerrarDialogo = document.getElementById("btn-cerrar-dialogo");
    const listaDisponibilidad = document.getElementById("lista-disponibilidad");
    const contadorDeseleccionados = document.getElementById("contador-deseleccionados");

    let discosDisponibles = [];
    let discosNoDisponibles = JSON.parse(localStorage.getItem("discosNoDisponibles")) || [];

    fetch("data/discos.json")
        .then((res) => res.json())
        .then((data) => {
            discosDisponibles = data.sort((a, b) => b.peso - a.peso);
        });

    function validarCampos() {
        const total = pesoTotalInput.value.trim();
        const barra = pesoBarraInput.value.trim();

        const totalNum = parseFloat(total.replace(",", "."));
        const barraNum = parseFloat(barra.replace(",", "."));

        const totalValido = total !== "" && !isNaN(totalNum) && totalNum > 0;
        const barraValido = barra !== "" && !isNaN(barraNum) && barraNum >= 0;

        const barraMayor = totalValido && barraValido && barraNum > totalNum;

        if (barraMayor) {
            errorMensaje.textContent =
                "El peso de la barra no puede ser mayor al peso objetivo.";
        } else {
            errorMensaje.textContent = "";
        }

        pesoTotalInput.classList.toggle("input-error", barraMayor);
        pesoBarraInput.classList.toggle("input-error", barraMayor);

        const sonValidos = totalValido && barraValido && !barraMayor;
        btnCalcular.disabled = !sonValidos;
    }

    pesoTotalInput.addEventListener("input", validarCampos);
    pesoBarraInput.addEventListener("input", validarCampos);

    form.addEventListener("submit", (e) => {
        e.preventDefault();

        let pesoTotal = parseFloat(pesoTotalInput.value.replace(",", "."));
        let pesoBarra = parseFloat(pesoBarraInput.value.replace(",", "."));

        const pesoDiscos = pesoTotal - pesoBarra;

        if (pesoDiscos <= 0) {
            return;
        }

        const pesoPorLado = pesoDiscos / 2;
        const resultado = calcularDiscos(pesoPorLado);
        mostrarResultado(resultado);
    });

    function calcularDiscos(pesoObjetivo) {
        let restante = pesoObjetivo;
        const usados = [];

        const disponiblesFiltrados = discosDisponibles.filter(d => !discosNoDisponibles.includes(d.peso));

        for (let disco of disponiblesFiltrados) {
            let cantidad = Math.floor(restante / disco.peso);
            if (cantidad > 0) {
                usados.push({ ...disco, cantidad });
                restante -= cantidad * disco.peso;
                restante = Math.round(restante * 100) / 100;
            }
        }

        return usados;
    }

    function mostrarResultado(discos) {
        discosDiv.innerHTML = "";

        if (discos.length === 0) {
            discosDiv.innerHTML =
                "<p>No se pudo alcanzar el peso con los discos disponibles.</p>";
            return;
        }

        discos.forEach((disco) => {
            const item = document.createElement("div");
            item.className = "disco-item";
            item.innerHTML = `
              <img src="${disco.imagen}" alt="Disco ${disco.peso}kg" />
              <div class="disco-texto">${disco.cantidad} x ${disco.peso}kg</div>
            `;
            discosDiv.appendChild(item);
        });
    }






    //##################################
    // Dialogo de disponibilidad de discos
    //##################################    


function actualizarContador() {
    contadorDeseleccionados.textContent = discosNoDisponibles.length;
}

function toggleDiscoSeleccionado(peso) {
    if (discosNoDisponibles.includes(peso)) {
        // Si ya está desactivado, lo quitamos
        discosNoDisponibles = discosNoDisponibles.filter(d => d !== peso);
    } else {
        // Lo añadimos a la lista de desactivados
        discosNoDisponibles.push(peso);
    }

    // Guardar en localStorage
    localStorage.setItem("discosNoDisponibles", JSON.stringify(discosNoDisponibles));

    // Actualizar UI
    renderizarDiscosDisponibilidad();
    actualizarContador();
}


function renderizarDiscosDisponibilidad() {
    listaDisponibilidad.innerHTML = "";

    discosDisponibles.forEach(disco => {
        const discoDiv = document.createElement("div");
        discoDiv.classList.add("disco-item");

        // Si este disco está en la lista de NO disponibles, aplicar estilo
        if (discosNoDisponibles.includes(disco.peso)) {
            discoDiv.classList.add("disco-deseleccionado");
        }

        discoDiv.innerHTML = `
            <img src="${disco.imagen}" alt="Disco ${disco.peso}kg">
            <div class="disco-texto">${disco.peso}kg</div>
        `;

        discoDiv.addEventListener("click", () => {
            toggleDiscoSeleccionado(disco.peso);
        });

        listaDisponibilidad.appendChild(discoDiv);
    });
}


btnDisponibilidad.addEventListener("click", (e) => {
    e.preventDefault();
    dialogo.classList.remove("oculto");
    renderizarDiscosDisponibilidad();
});

cerrarDialogo.addEventListener("click", () => {
    dialogo.classList.add("oculto");
});

dialogo.addEventListener("click", (e) => {
    if (e.target === dialogo) {
      dialogo.classList.add("oculto");
    }
  });
  
  // Botón "X"
  cerrarDialogo.addEventListener("click", () => {
    dialogo.classList.add("oculto");
  });




    actualizarContador();
});
