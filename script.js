// Appointment booking data
const appointmentData = {
    vet: null,
    vetPrice: null,
    date: null,
    time: null,
    firstname: '',
    lastname: '',
    email: '',
    phone: '',
    petname: '',
    pettype: '',
    reason: '',
    petcondition: ''
};

// Current step
let currentStep = 'vets';

// Steps order for navigation control
const stepsOrder = ['vets', 'datetime', 'details', 'summary'];
let completedSteps = [];

// Calendar state
let currentDate = new Date(2026, 0, 1); // January 2026

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    initializeVetSelection();
    initializeCalendar();
    initializeTimeSlots();
    initializeForm();
});

// Vet Selection
function initializeVetSelection() {
    const vetCards = document.querySelectorAll('.vet-card');
    vetCards.forEach(card => {
        card.addEventListener('click', function() {
            // Remove previous selection
            vetCards.forEach(c => c.classList.remove('selected'));
            // Add selection to clicked card
            this.classList.add('selected');
            appointmentData.vet = this.dataset.vet === 'omar' ? 'Dr. Omar Awwad' : 'Dr. Lina Haddad';
            // Get price from the card
            const priceElement = this.querySelector('.vet-price');
            if (priceElement) {
                appointmentData.vetPrice = this.dataset.vet === 'omar' ? '12.00' : '10.00';
            }
        });
    });
}

// Calendar Functions
function initializeCalendar() {
    renderCalendar();
}

function changeMonth(direction) {
    currentDate.setMonth(currentDate.getMonth() + direction);
    renderCalendar();
}

function renderCalendar() {
    const calendarGrid = document.getElementById('calendar-grid');
    const monthYear = document.getElementById('calendar-month');
    
    // Update month/year display
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];
    monthYear.textContent = `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    
    // Clear calendar
    calendarGrid.innerHTML = '';
    
    // Day names
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    dayNames.forEach(day => {
        const dayNameEl = document.createElement('div');
        dayNameEl.className = 'calendar-day-name';
        dayNameEl.textContent = day;
        calendarGrid.appendChild(dayNameEl);
    });
    
    // Get first day of month and number of days
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    // Previous month days
    const prevMonth = new Date(year, month, 0);
    const daysInPrevMonth = prevMonth.getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
        const dayEl = document.createElement('div');
        dayEl.className = 'calendar-day other-month';
        dayEl.textContent = daysInPrevMonth - i;
        calendarGrid.appendChild(dayEl);
    }
    
    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
        const dayEl = document.createElement('div');
        dayEl.className = 'calendar-day';
        dayEl.textContent = day;
        
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        if (appointmentData.date === dateStr) {
            dayEl.classList.add('selected');
        }
        
        dayEl.addEventListener('click', function() {
            // Remove previous selection
            document.querySelectorAll('.calendar-day').forEach(d => d.classList.remove('selected'));
            // Add selection
            this.classList.add('selected');
            appointmentData.date = dateStr;
        });
        
        calendarGrid.appendChild(dayEl);
    }
    
    // Next month days (fill remaining cells)
    const totalCells = calendarGrid.children.length;
    const remainingCells = 42 - totalCells; // 6 rows * 7 days
    for (let day = 1; day <= remainingCells && day <= 7; day++) {
        const dayEl = document.createElement('div');
        dayEl.className = 'calendar-day other-month';
        dayEl.textContent = day;
        calendarGrid.appendChild(dayEl);
    }
}

// Time Slot Selection
function initializeTimeSlots() {
    const timeSlotButtons = document.querySelectorAll('.timeslot-btn');
    timeSlotButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove previous selection
            timeSlotButtons.forEach(b => b.classList.remove('selected'));
            // Add selection
            this.classList.add('selected');
            appointmentData.time = this.dataset.time;
        });
    });
}

// Form Functions
function initializeForm() {
    const form = document.getElementById('details-form');
    const lastnameInput = document.getElementById('lastname');
    const lastnameError = document.getElementById('lastname-error');
    
    // Real-time validation
    lastnameInput.addEventListener('blur', function() {
        if (!this.value.trim()) {
            lastnameError.textContent = 'Please enter your lastname';
            lastnameError.classList.add('show');
        } else {
            lastnameError.classList.remove('show');
        }
    });
    
    lastnameInput.addEventListener('input', function() {
        if (this.value.trim()) {
            lastnameError.classList.remove('show');
        }
    });
    
    // Store form data
    form.addEventListener('input', function(e) {
        if (e.target.id === 'firstname') {
            appointmentData.firstname = e.target.value;
        } else if (e.target.id === 'lastname') {
            appointmentData.lastname = e.target.value;
        } else if (e.target.id === 'email') {
            appointmentData.email = e.target.value;
        } else if (e.target.id === 'phone') {
            appointmentData.phone = e.target.value;
        } else if (e.target.id === 'petname') {
            appointmentData.petname = e.target.value;
        } else if (e.target.id === 'reason') {
            appointmentData.reason = e.target.value;
        } else if (e.target.id === 'petcondition') {
            appointmentData.petcondition = e.target.value;
        }
    });
    
    // Also handle select change
    form.addEventListener('change', function(e) {
        if (e.target.id === 'pettype') {
            appointmentData.pettype = e.target.value;
        } else if (e.target.id === 'reason') {
            appointmentData.reason = e.target.value;
        }
    });
}

// Step Navigation
function goToStep(step) {
    const currentIndex = stepsOrder.indexOf(currentStep);
    const targetIndex = stepsOrder.indexOf(step);
    
    // Allow going back to previous steps always
    if (targetIndex < currentIndex) {
        // Going back is always allowed
    } else if (targetIndex > currentIndex && step !== 'confirmation') {
        // Going forward - validate current step
        if (currentStep === 'vets') {
            if (!appointmentData.vet) {
                alert('Please select a vet');
                return;
            }
            if (!completedSteps.includes('vets')) completedSteps.push('vets');
        } else if (currentStep === 'datetime') {
            if (!appointmentData.date || !appointmentData.time) {
                alert('Please select a date and time');
                return;
            }
            if (!completedSteps.includes('datetime')) completedSteps.push('datetime');
        } else if (currentStep === 'details') {
            const form = document.getElementById('details-form');
            if (!form.checkValidity()) {
                form.reportValidity();
                return;
            }
            if (!completedSteps.includes('details')) completedSteps.push('details');
            updateSummary();
        }
    }
    
    // Hide current step
    const currentStepEl = document.querySelector(`#${currentStep}-step`);
    if (currentStepEl) {
        currentStepEl.classList.remove('active');
        currentStepEl.style.animation = 'fadeOut 0.3s ease-in-out';
    }
    
    // Update sidebar (not for confirmation)
    if (step !== 'confirmation') {
        updateSidebar(step);
    }
    
    // Show new step
    setTimeout(() => {
        currentStep = step;
        const newStepEl = document.querySelector(`#${step}-step`);
        if (newStepEl) {
            newStepEl.classList.add('active');
            newStepEl.style.animation = 'fadeIn 0.4s ease-in-out';
        }
    }, 150);
}

// Check if step is accessible (for sidebar navigation)
function canAccessStep(step) {
    const stepIndex = stepsOrder.indexOf(step);
    const currentIndex = stepsOrder.indexOf(currentStep);
    
    // Can always go back to completed or current steps
    if (stepIndex <= currentIndex) return true;
    
    // Check if all previous steps are completed
    for (let i = 0; i < stepIndex; i++) {
        if (!completedSteps.includes(stepsOrder[i])) return false;
    }
    return true;
}

// Handle sidebar click
function handleSidebarClick(step) {
    const stepIndex = stepsOrder.indexOf(step);
    const currentIndex = stepsOrder.indexOf(currentStep);
    
    // Always allow going back
    if (stepIndex <= currentIndex) {
        goToStep(step);
        return;
    }
    
    // Check if can go forward
    if (canAccessStep(step)) {
        goToStep(step);
    }
    // If not accessible, do nothing (cursor will show not-allowed)
}

function updateSidebar(activeStep) {
    const stepItems = document.querySelectorAll('.step-item');
    const activeIndex = stepsOrder.indexOf(activeStep);
    
    stepItems.forEach(item => {
        const step = item.dataset.step;
        const stepIndex = stepsOrder.indexOf(step);
        const icon = item.querySelector('.step-icon');
        const text = item.querySelector('.step-text');
        
        if (step === activeStep) {
            item.classList.add('active');
            item.classList.remove('future-step');
            icon.classList.add('active');
            text.classList.add('active');
        } else {
            item.classList.remove('active');
            icon.classList.remove('active');
            text.classList.remove('active');
            
            // Mark future steps that aren't accessible
            if (stepIndex > activeIndex && !canAccessStep(step)) {
                item.classList.add('future-step');
            } else {
                item.classList.remove('future-step');
            }
        }
    });
}

// Summary Functions
function updateSummary() {
    // Customer name
    const customerName = `${appointmentData.firstname} ${appointmentData.lastname}`.trim();
    document.getElementById('summary-customer').textContent = customerName || '-';
    
    // Vet
    document.getElementById('summary-vet').textContent = appointmentData.vet || '-';
    
    // Date & Time
    if (appointmentData.date && appointmentData.time) {
        const date = new Date(appointmentData.date);
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'];
        const formattedDate = `${monthNames[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
        
        // Format time
        const [start, end] = appointmentData.time.split('-');
        const formatTime = (time) => {
            const [hours, minutes] = time.split(':');
            const hour = parseInt(hours);
            const ampm = hour >= 12 ? 'pm' : 'am';
            const displayHour = hour > 12 ? hour - 12 : (hour === 0 ? 12 : hour);
            return `${displayHour}:${minutes} ${ampm}`;
        };
        
        const timeStr = `${formatTime(start)} - ${formatTime(end)}`;
        document.getElementById('summary-datetime').textContent = `${formattedDate}, ${timeStr}`;
    } else {
        document.getElementById('summary-datetime').textContent = '-';
    }
    
    // Pet Name
    document.getElementById('summary-petname').textContent = appointmentData.petname || '-';
    
    // Pet Type
    document.getElementById('summary-pettype').textContent = appointmentData.pettype || '-';
    
    // Reason
    document.getElementById('summary-reason').textContent = appointmentData.reason || '-';
    
    // Total amount (from selected vet)
    const totalPrice = appointmentData.vetPrice || '10.00';
    document.getElementById('summary-total').textContent = `${totalPrice} د`;
}

// Book Appointment
function bookAppointment() {
    if (!appointmentData.vet || !appointmentData.date || !appointmentData.time) {
        alert('Please complete all steps');
        return;
    }
    
    // Generate booking ID
    const year = new Date().getFullYear();
    const randomNum = Math.floor(Math.random() * 10000).toString().padStart(5, '0');
    const bookingId = `PT-${year}-${randomNum}`;
    
    // Add booking metadata
    appointmentData.bookingId = bookingId;
    appointmentData.createdAt = new Date().toISOString();
    appointmentData.status = 'Pending';
    
    // Set vetId based on vet name
    if (appointmentData.vet === 'Dr. Omar Awwad') {
        appointmentData.vetId = 'omar';
    } else if (appointmentData.vet === 'Dr. Lina Haddad') {
        appointmentData.vetId = 'lina';
    }
    
    // Save to Local Storage
    saveBookingToLocalStorage(appointmentData);
    
    // Update UI
    document.getElementById('booking-id').textContent = bookingId;
    
    // Update confirmation details
    const customerName = `${appointmentData.firstname} ${appointmentData.lastname}`.trim();
    document.getElementById('confirm-customer').textContent = customerName || '-';
    
    // Format date and time
    if (appointmentData.date && appointmentData.time) {
        const date = new Date(appointmentData.date);
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'];
        const formattedDate = `${monthNames[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
        
        const [start, end] = appointmentData.time.split('-');
        const formatTime = (time) => {
            const [hours, minutes] = time.split(':');
            const hour = parseInt(hours);
            const ampm = hour >= 12 ? 'pm' : 'am';
            const displayHour = hour > 12 ? hour - 12 : (hour === 0 ? 12 : hour);
            return `${displayHour}:${minutes} ${ampm}`;
        };
        
        document.getElementById('confirm-datetime').textContent = `${formattedDate} ${formatTime(start)}`;
    }
    
    // Hide sidebar when showing confirmation
    document.querySelector('.sidebar-section').style.display = 'none';
    
    // Go to confirmation step
    goToStep('confirmation');
    
    console.log('Booking saved:', appointmentData);
}

// Save booking to Local Storage
function saveBookingToLocalStorage(booking) {
    // Get existing bookings
    let bookings = localStorage.getItem('petopiaBookings');
    bookings = bookings ? JSON.parse(bookings) : [];
    
    // Create a copy of booking data to save
    const bookingToSave = {
        bookingId: booking.bookingId,
        vetId: booking.vetId,
        vet: booking.vet,
        vetPrice: booking.vetPrice,
        date: booking.date,
        time: booking.time,
        firstname: booking.firstname,
        lastname: booking.lastname,
        email: booking.email,
        phone: booking.phone,
        petname: booking.petname,
        pettype: booking.pettype,
        reason: booking.reason,
        petcondition: booking.petcondition,
        status: booking.status,
        createdAt: booking.createdAt
    };
    
    // Add new booking
    bookings.push(bookingToSave);
    
    // Save back to Local Storage
    localStorage.setItem('petopiaBookings', JSON.stringify(bookings));
}

// Add to Calendar function
function addToCalendar(type) {
    const date = new Date(appointmentData.date);
    const [startTime] = appointmentData.time.split('-');
    const [hours, minutes] = startTime.split(':');
    date.setHours(parseInt(hours), parseInt(minutes));
    
    const endDate = new Date(date.getTime() + 60 * 60 * 1000); // 1 hour duration
    
    const title = encodeURIComponent('Vet Appointment - ' + appointmentData.vet);
    const details = encodeURIComponent('Pet: ' + appointmentData.petname + '\\nReason: ' + appointmentData.reason);
    
    let url = '';
    
    switch(type) {
        case 'google':
            const startStr = date.toISOString().replace(/-|:|\\.\\d{3}/g, '');
            const endStr = endDate.toISOString().replace(/-|:|\\.\\d{3}/g, '');
            url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startStr}/${endStr}&details=${details}`;
            break;
        case 'yahoo':
            url = `https://calendar.yahoo.com/?v=60&title=${title}&st=${date.toISOString()}&dur=0100&desc=${details}`;
            break;
        case 'outlook':
            url = `https://outlook.live.com/calendar/0/deeplink/compose?subject=${title}&startdt=${date.toISOString()}&enddt=${endDate.toISOString()}&body=${details}`;
            break;
        case 'ical':
            // Generate ICS file
            const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
DTSTART:${date.toISOString().replace(/-|:|\\.\\d{3}/g, '')}
DTEND:${endDate.toISOString().replace(/-|:|\\.\\d{3}/g, '')}
SUMMARY:Vet Appointment - ${appointmentData.vet}
DESCRIPTION:Pet: ${appointmentData.petname}, Reason: ${appointmentData.reason}
END:VEVENT
END:VCALENDAR`;
            const blob = new Blob([icsContent], { type: 'text/calendar' });
            url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'appointment.ics';
            a.click();
            return;
    }
    
    window.open(url, '_blank');
}

// Animation styles are now in CSS file

