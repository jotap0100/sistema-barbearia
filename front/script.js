/**
 * BARBEARIA DOM NAVALHA - FRONT-END CONTROLLER
 * Gerencia interações da UI, agendamento dinâmico, WhatsApp e FAQ.
 */

document.addEventListener("DOMContentLoaded", () => {
    initNavbar();
    initDatePicker();
    initTimeSlots();
    initBookingSync();
    initFaqAccordion();
    initBookingForm();
});

/* ==========================================================================
   1. NAVBAR & SCROLL
   ========================================================================== */
function initNavbar() {
    const navbar = document.getElementById("navbar");
    const menuToggle = document.getElementById("menu-toggle");
    const navMenu = document.getElementById("nav-menu");
    const navLinks = document.querySelectorAll(".nav-link");

    // Fixar fundo da navbar no scroll
    window.addEventListener("scroll", () => {
        if (window.scrollY > 50) {
            navbar.classList.add("scrolled");
        } else {
            navbar.classList.remove("scrolled");
        }
    });

    // Abrir/Fechar menu mobile
    if (menuToggle && navMenu) {
        menuToggle.addEventListener("click", () => {
            navMenu.classList.toggle("open");
            const icon = menuToggle.querySelector("i");
            if (navMenu.classList.contains("open")) {
                icon.classList.remove("fa-bars");
                icon.classList.add("fa-xmark");
            } else {
                icon.classList.remove("fa-xmark");
                icon.classList.add("fa-bars");
            }
        });

        // Fechar ao clicar em qualquer link
        navLinks.forEach(link => {
            link.addEventListener("click", () => {
                navMenu.classList.remove("open");
                const icon = menuToggle.querySelector("i");
                if (icon) {
                    icon.classList.remove("fa-xmark");
                    icon.classList.add("fa-bars");
                }
            });
        });
    }
}

/* ==========================================================================
   2. CONFIGURAÇÃO DE DATA (DATEPICKER)
   ========================================================================== */
function initDatePicker() {
    const dateInput = document.getElementById("booking-date");
    if (!dateInput) return;

    // Define data mínima como hoje (não permite agendar no passado)
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const minDateStr = `${yyyy}-${mm}-${dd}`;
    
    dateInput.min = minDateStr;
    dateInput.value = minDateStr; // pré-seleciona hoje

    // Ao mudar a data, recarrega horários e atualiza resumo
    dateInput.addEventListener("change", () => {
        initTimeSlots();
        updateSummary();
    });
}

/* ==========================================================================
   3. GERADOR DINÂMICO DE HORÁRIOS DISPONÍVEIS
   ========================================================================== */
const AVAILABLE_TIMES = [
    "09:00", "09:45", "10:30", "11:15", 
    "13:00", "13:45", "14:30", "15:15", 
    "16:00", "16:45", "17:30", "18:15", "19:00"
];

function initTimeSlots() {
    const container = document.getElementById("time-slots-container");
    const hiddenInput = document.getElementById("selected-time");
    const dateInput = document.getElementById("booking-date");
    if (!container || !hiddenInput) return;

    container.innerHTML = "";
    hiddenInput.value = "";

    const selectedDate = dateInput ? new Date(dateInput.value + "T00:00:00") : new Date();
    const isToday = new Date().toDateString() === selectedDate.toDateString();
    const now = new Date();
    const currentHour = now.getHours();
    const currentMin = now.getMinutes();

    let firstAvailableSet = false;

    AVAILABLE_TIMES.forEach(time => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "time-slot-btn";
        btn.textContent = time;

        const [tHour, tMin] = time.split(":").map(Number);
        const isPast = isToday && (tHour < currentHour || (tHour === currentHour && tMin <= currentMin));

        if (isPast) {
            btn.disabled = true;
            btn.title = "Horário já passou";
        } else {
            // Seleciona o primeiro horário válido por padrão
            if (!firstAvailableSet) {
                btn.classList.add("selected");
                hiddenInput.value = time;
                firstAvailableSet = true;
            }

            btn.addEventListener("click", () => {
                document.querySelectorAll(".time-slot-btn").forEach(b => b.classList.remove("selected"));
                btn.classList.add("selected");
                hiddenInput.value = time;
                updateSummary();
            });
        }

        container.appendChild(btn);
    });

    updateSummary();
}

/* ==========================================================================
   4. SINCRONIZAÇÃO DE CARDS COM FORMULÁRIO DE RESERVA
   ========================================================================== */
function initBookingSync() {
    const serviceSelect = document.getElementById("select-service");
    const barberSelect = document.getElementById("select-barber");

    // Botões dos Cards de Barbeiros ("Escolher Carlos", etc.)
    document.querySelectorAll(".select-barber-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            const barberName = btn.getAttribute("data-barber");
            if (barberSelect) {
                for (let option of barberSelect.options) {
                    if (option.value.includes(barberName) || barberName.includes(option.value)) {
                        barberSelect.value = option.value;
                        break;
                    }
                }
            }
            updateSummary();
            scrollToSection("reserva");
            showToast(`Barbeiro ${barberName} selecionado!`);
        });
    });

    // Botões dos Cards de Preço ("Agendar Este Serviço")
    document.querySelectorAll(".select-service-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const card = e.target.closest(".pricing-card");
            if (!card) return;
            const serviceName = card.getAttribute("data-service");

            if (serviceSelect) {
                for (let option of serviceSelect.options) {
                    if (option.value === serviceName) {
                        serviceSelect.value = serviceName;
                        break;
                    }
                }
            }
            updateSummary();
            scrollToSection("reserva");
            showToast(`Serviço "${serviceName}" selecionado!`);
        });
    });

    if (serviceSelect) {
        serviceSelect.addEventListener("change", updateSummary);
    }
    if (barberSelect) {
        barberSelect.addEventListener("change", updateSummary);
    }
}

function updateSummary() {
    const serviceSelect = document.getElementById("select-service");
    const barberSelect = document.getElementById("select-barber");
    const dateInput = document.getElementById("booking-date");
    const hiddenTime = document.getElementById("selected-time");

    const summaryService = document.getElementById("summary-service");
    const summaryBarber = document.getElementById("summary-barber");
    const summaryDateTime = document.getElementById("summary-datetime");
    const summaryPrice = document.getElementById("summary-price");

    // Atualiza Serviço e Preço
    if (serviceSelect && serviceSelect.selectedOptions[0]) {
        const selectedOpt = serviceSelect.selectedOptions[0];
        const price = selectedOpt.getAttribute("data-price") || "75.00";
        if (summaryService) summaryService.textContent = selectedOpt.value;
        if (summaryPrice) summaryPrice.textContent = `R$ ${parseFloat(price).toFixed(2).replace(".", ",")}`;
    }

    // Atualiza Barbeiro
    if (barberSelect && summaryBarber) {
        summaryBarber.textContent = barberSelect.value;
    }

    // Atualiza Data e Hora
    if (summaryDateTime) {
        const timeVal = hiddenTime && hiddenTime.value ? hiddenTime.value : "--:--";
        if (dateInput && dateInput.value) {
            const [y, m, d] = dateInput.value.split("-");
            summaryDateTime.textContent = `${d}/${m}/${y} às ${timeVal}`;
        } else {
            summaryDateTime.textContent = `Aguardando horário`;
        }
    }
}

function scrollToSection(id) {
    const el = document.getElementById(id);
    if (el) {
        el.scrollIntoView({ behavior: "smooth" });
    }
}

/* ==========================================================================
   5. ENVIO DO FORMULÁRIO E MODAL DE SUCESSO
   ========================================================================== */
function initBookingForm() {
    const form = document.getElementById("booking-form");
    const modal = document.getElementById("modal-success");
    const modalCloseBtn = document.getElementById("modal-close-btn");
    const modalTicket = document.getElementById("modal-ticket-details");
    const modalWhatsappBtn = document.getElementById("modal-whatsapp-btn");

    if (!form) return;

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const service = document.getElementById("select-service").value;
        const barber = document.getElementById("select-barber").value;
        const dateRaw = document.getElementById("booking-date").value;
        const time = document.getElementById("selected-time").value;
        const clientName = document.getElementById("client-name").value.trim();
        const clientPhone = document.getElementById("client-phone").value.trim();
        const clientEmail = document.getElementById("client-email").value.trim();
        const clientNotes = document.getElementById("client-notes").value.trim();

        if (!time) {
            showToast("Por favor, selecione um horário disponível.");
            return;
        }

        // Formata data brasileira
        const [y, m, d] = dateRaw.split("-");
        const formattedDate = `${d}/${m}/${y}`;
        const bookingCode = `DN-${Math.floor(1000 + Math.random() * 9000)}`;

        // Preço do serviço selecionado
        const serviceSelect = document.getElementById("select-service");
        const price = serviceSelect.selectedOptions[0]?.getAttribute("data-price") || "75.00";
        const formattedPrice = `R$ ${parseFloat(price).toFixed(2).replace(".", ",")}`;

        // Dados do agendamento
        const bookingData = {
            codigo: bookingCode,
            cliente: clientName,
            telefone: clientPhone,
            email: clientEmail,
            servico: service,
            barbeiro: barber,
            data: formattedDate,
            hora: time,
            valor: formattedPrice,
            observacoes: clientNotes
        };

        // Envia para o backend se disponível
        try {
            await fetch("/api/agendamentos", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(bookingData)
            });
        } catch (err) {
            console.warn("Backend API offline ou não configurado ainda. Agendamento processado localmente.", err);
        }

        // Monta o comprovante no modal
        if (modalTicket) {
            modalTicket.innerHTML = `
                <div class="ticket-line"><span>Código da Reserva:</span> <strong class="gold-text">${bookingCode}</strong></div>
                <div class="ticket-line"><span>Cliente:</span> <strong>${clientName}</strong></div>
                <div class="ticket-line"><span>Telefone:</span> <strong>${clientPhone}</strong></div>
                <div class="ticket-line"><span>Serviço:</span> <strong>${service}</strong></div>
                <div class="ticket-line"><span>Barbeiro:</span> <strong>${barber}</strong></div>
                <div class="ticket-line"><span>Data & Horário:</span> <strong>${formattedDate} às ${time}</strong></div>
                <div class="ticket-line"><span>Total Estimado:</span> <strong class="gold-text">${formattedPrice}</strong></div>
            `;
        }

        // Configura mensagem pré-formatada para o WhatsApp
        if (modalWhatsappBtn) {
            const whatsAppText = encodeURIComponent(
                `💈 *CONFIRMAÇÃO DE AGENDAMENTO - DOM NAVALHA* 💈\n\n` +
                `*Código:* ${bookingCode}\n` +
                `*Cliente:* ${clientName}\n` +
                `*WhatsApp:* ${clientPhone}\n` +
                `*Serviço:* ${service} (${formattedPrice})\n` +
                `*Barbeiro:* ${barber}\n` +
                `*Data:* ${formattedDate} às ${time}\n` +
                (clientNotes ? `*Observações:* ${clientNotes}\n` : "") +
                `\nOlá, gostaria de confirmar o agendamento acima realizado pelo site!`
            );
            modalWhatsappBtn.onclick = () => {
                window.open(`https://wa.me/5511987654321?text=${whatsAppText}`, "_blank");
            };
        }

        // Abre o modal
        if (modal) {
            modal.classList.add("open");
        }

        form.reset();
        initDatePicker();
        initTimeSlots();
    });

    // Fechar modal
    if (modalCloseBtn && modal) {
        modalCloseBtn.addEventListener("click", () => {
            modal.classList.remove("open");
        });
        modal.addEventListener("click", (e) => {
            if (e.target === modal) {
                modal.classList.remove("open");
            }
        });
    }
}

/* ==========================================================================
   6. FAQ ACCORDION
   ========================================================================== */
function initFaqAccordion() {
    const faqItems = document.querySelectorAll(".faq-item");

    faqItems.forEach(item => {
        const questionBtn = item.querySelector(".faq-question");
        const answer = item.querySelector(".faq-answer");

        if (questionBtn && answer) {
            questionBtn.addEventListener("click", () => {
                const isActive = item.classList.contains("active");

                // Fecha outros
                faqItems.forEach(other => {
                    other.classList.remove("active");
                    const otherAnswer = other.querySelector(".faq-answer");
                    if (otherAnswer) otherAnswer.style.maxHeight = null;
                });

                // Alterna o atual
                if (!isActive) {
                    item.classList.add("active");
                    answer.style.maxHeight = answer.scrollHeight + "px";
                }
            });
        }
    });
}

/* ==========================================================================
   7. TOAST NOTIFICATION
   ========================================================================== */
function showToast(message) {
    const toast = document.getElementById("toast");
    if (!toast) return;

    toast.textContent = message;
    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 3200);
}

