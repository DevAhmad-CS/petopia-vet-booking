// Vet Dashboard JavaScript

// Check authentication
function checkAuth() {
    const loggedInVet = sessionStorage.getItem('loggedInVet');
    if (!loggedInVet) {
        window.location.href = 'vet-login.html';
        return false;
    }
    return true;
}

// Get logged in vet info
function getVetInfo() {
    return {
        id: sessionStorage.getItem('loggedInVet'),
        name: sessionStorage.getItem('vetName')
    };
}

// Logout function
function logout() {
    sessionStorage.removeItem('loggedInVet');
    sessionStorage.removeItem('vetName');
    window.location.href = 'vet-login.html';
}

// Get all bookings from Local Storage
function getAllBookings() {
    const bookings = localStorage.getItem('petopiaBookings');
    return bookings ? JSON.parse(bookings) : [];
}

// Get bookings for current vet
function getVetBookings() {
    const vetInfo = getVetInfo();
    const allBookings = getAllBookings();
    
    // Filter bookings for this vet
    return allBookings.filter(booking => {
        // Match by vetId or vetName
        return booking.vetId === vetInfo.id || 
               booking.vet === vetInfo.name ||
               (vetInfo.id === 'omar' && booking.vet === 'Dr. Omar Awwad') ||
               (vetInfo.id === 'lina' && booking.vet === 'Dr. Lina Haddad');
    });
}

// Update booking status in Local Storage
function updateBookingStatus(bookingId, newStatus) {
    const allBookings = getAllBookings();
    const bookingIndex = allBookings.findIndex(b => b.bookingId === bookingId);
    
    if (bookingIndex !== -1) {
        allBookings[bookingIndex].status = newStatus;
        localStorage.setItem('petopiaBookings', JSON.stringify(allBookings));
        showToast('Status updated successfully', 'success');
        updateStats();
        return true;
    }
    
    showToast('Failed to update status', 'error');
    return false;
}

// Delete booking from Local Storage
function deleteBooking(bookingId) {
    if (!confirm('Are you sure you want to delete this booking?')) {
        return;
    }
    
    const allBookings = getAllBookings();
    const filteredBookings = allBookings.filter(b => b.bookingId !== bookingId);
    
    localStorage.setItem('petopiaBookings', JSON.stringify(filteredBookings));
    showToast('Booking deleted successfully', 'success');
    loadBookings();
}

// Format date for display
function formatDate(dateString) {
    if (!dateString) return '-';
    
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

// Format time for display
function formatTime(timeString) {
    if (!timeString) return '-';
    
    // If it's already formatted or contains AM/PM
    if (timeString.includes('am') || timeString.includes('pm') || timeString.includes('AM') || timeString.includes('PM')) {
        return timeString;
    }
    
    // Parse time range like "09:00-10:00"
    const [start, end] = timeString.split('-');
    if (!start) return timeString;
    
    const formatSingleTime = (time) => {
        const [hours, minutes] = time.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour > 12 ? hour - 12 : (hour === 0 ? 12 : hour);
        return `${displayHour}:${minutes} ${ampm}`;
    };
    
    if (end) {
        return `${formatSingleTime(start)} - ${formatSingleTime(end)}`;
    }
    return formatSingleTime(start);
}

// Format booked at date/time
function formatBookedAt(dateString) {
    if (!dateString) return '-';
    
    const date = new Date(dateString);
    const day = date.getDate();
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = monthNames[date.getMonth()];
    
    const hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHour = hours > 12 ? hours - 12 : (hours === 0 ? 12 : hours);
    
    return `${day} ${month}, ${displayHour}:${minutes} ${ampm}`;
}

// Get pet type emoji
function getPetEmoji(petType) {
    const type = (petType || '').toLowerCase();
    if (type.includes('cat')) return '🐱';
    if (type.includes('dog')) return '🐕';
    if (type.includes('bird')) return '🐦';
    if (type.includes('fish')) return '🐟';
    if (type.includes('rabbit')) return '🐰';
    return '🐾';
}

// Get status class
function getStatusClass(status) {
    const statusLower = (status || 'pending').toLowerCase();
    if (statusLower === 'completed' || statusLower === 'confirmed') return 'completed';
    if (statusLower === 'cancelled') return 'cancelled';
    return 'pending';
}

// Get status display text
function getStatusText(status) {
    const statusLower = (status || 'pending').toLowerCase();
    if (statusLower === 'completed' || statusLower === 'confirmed') return 'Confirmed';
    if (statusLower === 'cancelled') return 'Cancelled';
    return 'Awaiting Vet Confirmation';
}

// Render bookings table
function renderBookings(bookings) {
    const tbody = document.getElementById('bookings-tbody');
    const emptyState = document.getElementById('empty-state');
    const bookingCount = document.getElementById('booking-count');
    
    if (!bookings || bookings.length === 0) {
        tbody.innerHTML = '';
        emptyState.style.display = 'block';
        bookingCount.textContent = '0 bookings';
        return;
    }
    
    emptyState.style.display = 'none';
    bookingCount.textContent = `${bookings.length} booking${bookings.length !== 1 ? 's' : ''}`;
    
    tbody.innerHTML = bookings.map(booking => {
        const statusClass = getStatusClass(booking.status);
        const currentStatus = booking.status || 'Pending';
        
        return `
        <tr>
            <td>
                <span class="booking-id">${booking.bookingId || 'N/A'}</span>
            </td>
            <td>
                <div class="pet-info">
                    <span class="pet-type-icon">${getPetEmoji(booking.pettype || booking.petType)}</span>
                    <div>
                        <strong>${booking.petname || booking.petName || 'Unknown'}</strong>
                        <br>
                        <small style="color: #666;">${booking.pettype || booking.petType || 'Unknown'}</small>
                    </div>
                </div>
            </td>
            <td>${formatDate(booking.date)}</td>
            <td>${formatTime(booking.time || booking.timeSlot)}</td>
            <td>${booking.reason || '-'}</td>
            <td style="color: #666; font-size: 0.9rem;">${formatBookedAt(booking.createdAt)}</td>
            <td>
                <select class="status-select ${statusClass}" 
                        onchange="handleStatusChange('${booking.bookingId}', this.value)">
                    <option value="Pending" ${currentStatus === 'Pending' ? 'selected' : ''}>Awaiting Vet Confirmation</option>
                    <option value="Completed" ${currentStatus === 'Completed' ? 'selected' : ''}>Confirmed</option>
                    <option value="Cancelled" ${currentStatus === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
                </select>
            </td>
            <td>
                <div style="display: flex; gap: 0.5rem; align-items: center;">
                    <button class="action-btn" onclick="viewBookingDetails('${booking.bookingId}')" title="View Details" style="color: #FF9C00;">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                            <circle cx="12" cy="12" r="3"/>
                        </svg>
                    </button>
                    <button class="action-btn delete" onclick="deleteBooking('${booking.bookingId}')" title="Delete">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                            <line x1="10" y1="11" x2="10" y2="17"/>
                            <line x1="14" y1="11" x2="14" y2="17"/>
                        </svg>
                    </button>
                </div>
            </td>
        </tr>
    `}).join('');
}

// Handle status change from table
function handleStatusChange(bookingId, newStatus) {
    // Use the same confirmation flow as modal
    changeBookingStatusFromModal(bookingId, newStatus);
    
    // Note: The select styling will be updated after confirmation/rejection
}

// Update statistics
function updateStats() {
    const bookings = getVetBookings();
    
    const total = bookings.length;
    const pending = bookings.filter(b => !b.status || b.status === 'Pending').length;
    const completed = bookings.filter(b => b.status === 'Completed' || b.status === 'Confirmed').length;
    const cancelled = bookings.filter(b => b.status === 'Cancelled').length;
    
    document.getElementById('total-bookings').textContent = total;
    document.getElementById('pending-bookings').textContent = pending;
    document.getElementById('completed-bookings').textContent = completed;
    document.getElementById('cancelled-bookings').textContent = cancelled;
}

// Set status filter from chip
let currentStatusFilter = 'all';

function setStatusFilter(status) {
    currentStatusFilter = status;
    
    // Update chip active states
    document.querySelectorAll('.filter-chip').forEach(chip => {
        chip.classList.remove('active');
        if (chip.dataset.status === status) {
            chip.classList.add('active');
        }
    });
    
    filterBookings();
}

// Filter bookings
function filterBookings() {
    const dateFilter = document.getElementById('date-filter').value;
    const searchTerm = document.getElementById('search-input').value.toLowerCase().trim();
    
    let bookings = getVetBookings();
    
    // Filter by status (from chips)
    if (currentStatusFilter !== 'all') {
        bookings = bookings.filter(b => {
            const bookingStatus = b.status || 'Pending';
            return bookingStatus === currentStatusFilter;
        });
    }
    
    // Filter by search term
    if (searchTerm) {
        bookings = bookings.filter(b => {
            const bookingId = (b.bookingId || '').toLowerCase();
            const petName = (b.petname || b.petName || '').toLowerCase();
            const ownerName = `${b.firstname || b.firstName || ''} ${b.lastname || b.lastName || ''}`.toLowerCase();
            
            return bookingId.includes(searchTerm) ||
                   petName.includes(searchTerm) ||
                   ownerName.includes(searchTerm);
        });
    }
    
    // Filter by date
    if (dateFilter !== 'all') {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        bookings = bookings.filter(b => {
            if (!b.date) return false;
            const bookingDate = new Date(b.date);
            bookingDate.setHours(0, 0, 0, 0);
            
            switch (dateFilter) {
                case 'today':
                    return bookingDate.getTime() === today.getTime();
                case 'week':
                    const weekAgo = new Date(today);
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    const weekLater = new Date(today);
                    weekLater.setDate(weekLater.getDate() + 7);
                    return bookingDate >= weekAgo && bookingDate <= weekLater;
                case 'month':
                    return bookingDate.getMonth() === today.getMonth() && 
                           bookingDate.getFullYear() === today.getFullYear();
                default:
                    return true;
            }
        });
    }
    
    renderBookings(bookings);
}

// Load bookings
function loadBookings() {
    const bookings = getVetBookings();
    renderBookings(bookings);
    updateStats();
}

// Show toast notification
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toast-message');
    
    toast.className = `toast ${type}`;
    toastMessage.textContent = message;
    
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Initialize dashboard
function initDashboard() {
    if (!checkAuth()) return;
    
    const vetInfo = getVetInfo();
    document.getElementById('vet-name').textContent = vetInfo.name;
    
    loadBookings();
}

// Add demo bookings for testing (can be removed in production)
function addDemoBookings() {
    const existingBookings = getAllBookings();
    
    // Only add demo data if there are no bookings
    if (existingBookings.length > 0) return;
    
    const demoBookings = [
        {
            bookingId: 'PT-2026-001',
            vetId: 'omar',
            vet: 'Dr. Omar Awwad',
            vetPrice: '12.00',
            date: '2026-01-15',
            time: '09:00-10:00',
            firstname: 'Ahmad',
            lastname: 'Mahmoud',
            email: 'ahmad@email.com',
            phone: '+962 79 123 4567',
            petname: 'Luna',
            pettype: 'Cat',
            reason: 'Vaccination',
            petcondition: 'Healthy, needs annual shots',
            status: 'Pending',
            createdAt: new Date().toISOString()
        },
        {
            bookingId: 'PT-2026-002',
            vetId: 'omar',
            vet: 'Dr. Omar Awwad',
            vetPrice: '12.00',
            date: '2026-01-16',
            time: '11:00-12:00',
            firstname: 'Sara',
            lastname: 'Al-Rimawi',
            email: 'sara@email.com',
            phone: '+962 78 987 6543',
            petname: 'Max',
            pettype: 'Dog',
            reason: 'General Checkup',
            petcondition: 'Slight limping on left leg',
            status: 'Pending',
            createdAt: new Date().toISOString()
        },
        {
            bookingId: 'PT-2026-003',
            vetId: 'lina',
            vet: 'Dr. Lina Haddad',
            vetPrice: '10.00',
            date: '2026-01-15',
            time: '14:00-15:00',
            firstname: 'Mohammad',
            lastname: 'Hassan',
            email: 'moh@email.com',
            phone: '+962 77 555 1234',
            petname: 'Bella',
            pettype: 'Cat',
            reason: 'Dental Care',
            petcondition: 'Bad breath, possible tooth decay',
            status: 'Completed',
            createdAt: new Date().toISOString()
        },
        {
            bookingId: 'PT-2026-004',
            vetId: 'lina',
            vet: 'Dr. Lina Haddad',
            vetPrice: '10.00',
            date: '2026-01-17',
            time: '10:00-11:00',
            firstname: 'Layla',
            lastname: 'Nasser',
            email: 'layla@email.com',
            phone: '+962 79 888 4321',
            petname: 'Rocky',
            pettype: 'Dog',
            reason: 'Skin Issues',
            petcondition: 'Itching and hair loss on back',
            status: 'Pending',
            createdAt: new Date().toISOString()
        }
    ];
    
    localStorage.setItem('petopiaBookings', JSON.stringify(demoBookings));
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    addDemoBookings(); // Add demo data for testing
    initDashboard();
    goToCurrentWeek(); // Initialize calendar to current week
});

// ============ Section Navigation ============

function showSection(section) {
    const appointmentsSection = document.getElementById('appointments-section');
    const availabilitySection = document.getElementById('availability-section');
    const statsGrid = document.querySelector('.stats-grid');
    const filterSection = document.querySelector('.filter-section');
    const navBtns = document.querySelectorAll('.vet-nav-btn');
    
    navBtns.forEach(btn => btn.classList.remove('active'));
    
    if (section === 'appointments') {
        appointmentsSection.style.display = 'block';
        availabilitySection.classList.remove('active');
        statsGrid.style.display = 'grid';
        filterSection.style.display = 'flex';
        document.querySelector('[onclick="showSection(\'appointments\')"]').classList.add('active');
    } else if (section === 'availability') {
        appointmentsSection.style.display = 'none';
        availabilitySection.classList.add('active');
        statsGrid.style.display = 'none';
        filterSection.style.display = 'none';
        document.querySelector('[onclick="showSection(\'availability\')"]').classList.add('active');
    }
}

// ============ Notes Modal ============

function showNotes(encodedNotes) {
    const notes = decodeURIComponent(encodedNotes);
    const modal = document.getElementById('notes-modal');
    const body = document.getElementById('notes-modal-body');
    
    body.innerHTML = notes || '<span class="no-notes">No notes provided</span>';
    modal.classList.add('show');
}

function closeNotesModal() {
    document.getElementById('notes-modal').classList.remove('show');
}

// ============ Availability Management ============

function getVetAvailability() {
    const vetInfo = getVetInfo();
    const key = `petopiaAvailability_${vetInfo.id}`;
    const availability = localStorage.getItem(key);
    return availability ? JSON.parse(availability) : getDefaultAvailability();
}

function saveVetAvailability(slots) {
    const vetInfo = getVetInfo();
    const key = `petopiaAvailability_${vetInfo.id}`;
    localStorage.setItem(key, JSON.stringify(slots));
}

function getDefaultAvailability() {
    return [
        { id: 1, day: 'Sunday', from: '09:00', to: '12:00', active: true },
        { id: 2, day: 'Sunday', from: '14:00', to: '17:00', active: true },
        { id: 3, day: 'Monday', from: '09:00', to: '12:00', active: true },
        { id: 4, day: 'Monday', from: '14:00', to: '17:00', active: true },
        { id: 5, day: 'Tuesday', from: '09:00', to: '12:00', active: true },
        { id: 6, day: 'Wednesday', from: '09:00', to: '12:00', active: false },
        { id: 7, day: 'Thursday', from: '09:00', to: '12:00', active: true },
        { id: 8, day: 'Thursday', from: '14:00', to: '17:00', active: true },
    ];
}

// Current week offset (0 = current week, -1 = previous week, etc.)
let currentWeekOffset = 0;

// Get current week dates
function getCurrentWeekDates() {
    const today = new Date();
    const currentDate = new Date(today);
    currentDate.setDate(today.getDate() + (currentWeekOffset * 7));
    
    // Get Sunday of the week
    const day = currentDate.getDay();
    const diff = currentDate.getDate() - day;
    const sunday = new Date(currentDate.setDate(diff));
    
    const weekDates = [];
    for (let i = 0; i < 7; i++) {
        const date = new Date(sunday);
        date.setDate(sunday.getDate() + i);
        weekDates.push(date);
    }
    
    return weekDates;
}

// Format week dates for display
function formatWeekDates(weekDates) {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const start = weekDates[0];
    const end = weekDates[6];
    
    if (start.getMonth() === end.getMonth()) {
        return `${start.getDate()} - ${end.getDate()} ${monthNames[start.getMonth()]} ${start.getFullYear()}`;
    } else {
        return `${start.getDate()} ${monthNames[start.getMonth()]} - ${end.getDate()} ${monthNames[end.getMonth()]} ${start.getFullYear()}`;
    }
}

// Update week headers with dates
function updateWeekHeaders() {
    const weekDates = getCurrentWeekDates();
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    weekDates.forEach((date, index) => {
        const header = document.getElementById(`day-header-${index}`);
        if (header) {
            const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][index];
            header.innerHTML = `${dayName}<br><span style="font-size: 0.75rem; font-weight: 400; opacity: 0.9;">${date.getDate()} ${monthNames[date.getMonth()]}</span>`;
        }
    });
    
    // Update week dates display
    const weekDatesDisplay = document.getElementById('calendar-week-dates');
    if (weekDatesDisplay) {
        weekDatesDisplay.textContent = formatWeekDates(weekDates);
    }
}

// Change week
function changeWeek(direction) {
    currentWeekOffset += direction;
    updateWeekHeaders();
    loadAvailabilitySlots();
}

// Go to current week
function goToCurrentWeek() {
    currentWeekOffset = 0;
    updateWeekHeaders();
    loadAvailabilitySlots();
}

// Generate time slots (every hour from 9 AM to 6 PM)
function generateTimeSlots() {
    const slots = [];
    for (let hour = 9; hour <= 18; hour++) {
        slots.push(`${String(hour).padStart(2, '0')}:00`);
    }
    return slots;
}

// Get day index (0 = Sunday, 6 = Saturday)
function getDayIndex(dayName) {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days.indexOf(dayName);
}

// Check if time overlaps with existing slots
function hasTimeOverlap(slots, day, from, to, excludeId = null) {
    return slots.some(slot => {
        if (slot.id === excludeId) return false;
        if (slot.day !== day) return false;
        if (!slot.active) return false;
        
        const slotFrom = timeToMinutes(slot.from);
        const slotTo = timeToMinutes(slot.to);
        const newFrom = timeToMinutes(from);
        const newTo = timeToMinutes(to);
        
        return (newFrom < slotTo && newTo > slotFrom);
    });
}

// Check if slot already exists
function slotExists(slots, day, from, to, excludeId = null) {
    return slots.some(slot => {
        if (slot.id === excludeId) return false;
        return slot.day === day && slot.from === from && slot.to === to;
    });
}

// Convert time to minutes for comparison
function timeToMinutes(time) {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
}

function loadAvailabilitySlots() {
    const slots = getVetAvailability();
    const tbody = document.getElementById('calendar-tbody');
    
    if (!tbody) return;
    
    // Update week headers
    updateWeekHeaders();
    
    const timeSlots = generateTimeSlots();
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    // Track which cells are already filled (for rowspan)
    const filledCells = {};
    
    tbody.innerHTML = timeSlots.map((time, timeIndex) => {
        const timeDisplay = formatTimeDisplay(time);
        let row = `<tr><td class="calendar-time-cell">${timeDisplay}</td>`;
        
        days.forEach((day, dayIndex) => {
            const cellKey = `${timeIndex}-${dayIndex}`;
            
            // Skip if this cell is already filled by a rowspan
            if (filledCells[cellKey]) {
                return;
            }
            
            const daySlots = slots.filter(s => s.day === day);
            const relevantSlots = daySlots.filter(s => {
                const slotFrom = timeToMinutes(s.from);
                const slotTo = timeToMinutes(s.to);
                const currentTime = timeToMinutes(time);
                return currentTime >= slotFrom && currentTime < slotTo;
            });
            
            if (relevantSlots.length > 0) {
                const slot = relevantSlots[0];
                const isFirstInSlot = timeToMinutes(slot.from) === timeToMinutes(time);
                
                if (isFirstInSlot) {
                    const rowspan = Math.ceil((timeToMinutes(slot.to) - timeToMinutes(slot.from)) / 60);
                    
                    // Mark cells as filled
                    for (let i = 0; i < rowspan; i++) {
                        filledCells[`${timeIndex + i}-${dayIndex}`] = true;
                    }
                    
                    row += `<td class="calendar-cell has-slot" rowspan="${rowspan}">
                        <div class="slot-block ${slot.active ? '' : 'inactive'}">
                            <div class="slot-block-time">${formatTimeDisplay(slot.from)} - ${formatTimeDisplay(slot.to)}</div>
                            <div class="slot-block-status">${slot.active ? '✓ Active' : '✗ Inactive'}</div>
                            <div class="slot-block-actions">
                                <button class="slot-action-btn toggle ${slot.active ? '' : 'inactive'}" onclick="toggleSlot(${slot.id})" title="${slot.active ? 'Disable Slot' : 'Enable Slot'}">
                                    ${slot.active ? `
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                                            <polyline points="22 4 12 14.01 9 11.01"/>
                                        </svg>
                                        <span>Active</span>
                                    ` : `
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <circle cx="12" cy="12" r="10"/>
                                            <line x1="15" y1="9" x2="9" y2="15"/>
                                            <line x1="9" y1="9" x2="15" y2="15"/>
                                        </svg>
                                        <span>Inactive</span>
                                    `}
                                </button>
                                <button class="slot-action-btn edit" onclick="editSlot(${slot.id})" title="Edit Time Slot">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                    </svg>
                                    <span>Edit</span>
                                </button>
                                <button class="slot-action-btn delete" onclick="confirmDeleteSlot(${slot.id})" title="Delete Time Slot">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <polyline points="3 6 5 6 21 6"/>
                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                                    </svg>
                                    <span>Delete</span>
                                </button>
                            </div>
                        </div>
                    </td>`;
                }
            } else {
                row += `<td class="calendar-cell" onclick="addSlotAtTime('${day}', '${time}')">
                    <div class="empty-cell-hint">Click to add slot</div>
                </td>`;
            }
        });
        
        row += '</tr>';
        return row;
    }).join('');
}

function formatTimeDisplay(time) {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : (hour === 0 ? 12 : hour);
    return `${displayHour}:${minutes} ${ampm}`;
}

function toggleSlot(slotId) {
    const slots = getVetAvailability();
    const slotIndex = slots.findIndex(s => s.id === slotId);
    
    if (slotIndex !== -1) {
        slots[slotIndex].active = !slots[slotIndex].active;
        saveVetAvailability(slots);
        loadAvailabilitySlots();
        showToast('Availability updated', 'success');
    }
}

// Store editing slot ID
let editingSlotId = null;

// Add slot at specific time (from calendar click)
function addSlotAtTime(day, time) {
    editingSlotId = null;
    document.getElementById('slot-modal-title').textContent = 'Add New Time Slot';
    document.getElementById('slot-submit-btn').textContent = 'Save Time Slot';
    
    document.getElementById('slot-day').value = day;
    document.getElementById('slot-from').value = time;
    
    // Set default end time (1 hour later)
    const [hours, minutes] = time.split(':').map(Number);
    const endHour = (hours + 1) % 24;
    document.getElementById('slot-to').value = `${String(endHour).padStart(2, '0')}:${minutes}`;
    
    document.getElementById('slot-validation-error').style.display = 'none';
    document.getElementById('slot-modal').classList.add('show');
    document.body.style.overflow = 'hidden';
}

function editSlot(slotId) {
    const slots = getVetAvailability();
    const slot = slots.find(s => s.id === slotId);
    
    if (!slot) return;
    
    editingSlotId = slotId;
    document.getElementById('slot-modal-title').textContent = 'Edit Time Slot';
    document.getElementById('slot-submit-btn').textContent = 'Update Time Slot';
    
    document.getElementById('slot-day').value = slot.day;
    document.getElementById('slot-from').value = slot.from;
    document.getElementById('slot-to').value = slot.to;
    
    document.getElementById('slot-validation-error').style.display = 'none';
    document.getElementById('slot-modal').classList.add('show');
    document.body.style.overflow = 'hidden';
}

function confirmDeleteSlot(slotId) {
    // Use confirmation modal
    pendingAction.bookingId = slotId;
    pendingAction.action = 'deleteSlot';
    
    const confirmationModal = document.getElementById('confirmation-modal');
    const message = document.getElementById('confirmation-message');
    const actionBtn = document.getElementById('confirmation-action-btn');
    
    message.textContent = 'Are you sure you want to delete this time slot?';
    actionBtn.textContent = 'Yes, Delete';
    actionBtn.className = 'confirmation-btn reject';
    
    confirmationModal.classList.add('show');
    document.body.style.overflow = 'hidden';
}

function deleteSlot(slotId) {
    const slots = getVetAvailability();
    const filteredSlots = slots.filter(s => s.id !== slotId);
    saveVetAvailability(filteredSlots);
    loadAvailabilitySlots();
    showToast('Time slot deleted', 'success');
}

function addNewSlot() {
    editingSlotId = null;
    document.getElementById('slot-modal-title').textContent = 'Add New Time Slot';
    document.getElementById('slot-submit-btn').textContent = 'Save Time Slot';
    document.getElementById('slot-form').reset();
    document.getElementById('slot-validation-error').style.display = 'none';
    document.getElementById('slot-modal').classList.add('show');
    document.body.style.overflow = 'hidden';
}

function closeSlotModal() {
    document.getElementById('slot-modal').classList.remove('show');
    document.getElementById('slot-form').reset();
    document.getElementById('slot-validation-error').style.display = 'none';
    editingSlotId = null;
    document.body.style.overflow = '';
}

function saveSlot(event) {
    event.preventDefault();
    
    const errorDiv = document.getElementById('slot-validation-error');
    errorDiv.style.display = 'none';
    
    const day = document.getElementById('slot-day').value;
    const from = document.getElementById('slot-from').value;
    const to = document.getElementById('slot-to').value;
    
    // Validation 1: From must be before To
    if (from >= to) {
        errorDiv.textContent = 'End time must be after start time';
        errorDiv.style.display = 'block';
        return;
    }
    
    const slots = getVetAvailability();
    
    // Validation 2: Check for duplicate slot
    if (slotExists(slots, day, from, to, editingSlotId)) {
        errorDiv.textContent = 'This time slot already exists for this day';
        errorDiv.style.display = 'block';
        return;
    }
    
    // Validation 3: Check for overlap
    if (hasTimeOverlap(slots, day, from, to, editingSlotId)) {
        errorDiv.textContent = 'This time slot overlaps with an existing slot';
        errorDiv.style.display = 'block';
        return;
    }
    
    if (editingSlotId) {
        // Update existing slot
        const slotIndex = slots.findIndex(s => s.id === editingSlotId);
        if (slotIndex !== -1) {
            slots[slotIndex].day = day;
            slots[slotIndex].from = from;
            slots[slotIndex].to = to;
            saveVetAvailability(slots);
            loadAvailabilitySlots();
            closeSlotModal();
            showToast('Time slot updated successfully', 'success');
        }
    } else {
        // Add new slot
        const newId = Math.max(...slots.map(s => s.id), 0) + 1;
        slots.push({
            id: newId,
            day: day,
            from: from,
            to: to,
            active: true
        });
        saveVetAvailability(slots);
        loadAvailabilitySlots();
        closeSlotModal();
        showToast('Time slot added successfully', 'success');
    }
}

// View booking details
function viewBookingDetails(bookingId) {
    const allBookings = getAllBookings();
    const booking = allBookings.find(b => b.bookingId === bookingId);
    
    if (!booking) {
        showToast('Booking not found', 'error');
        return;
    }
    
    const modal = document.getElementById('booking-details-modal');
    const body = document.getElementById('booking-details-body');
    const statusClass = getStatusClass(booking.status);
    const currentStatus = booking.status || 'Pending';
    const notes = booking.petcondition || booking.condition || '';
    
    body.innerHTML = `
        <div class="booking-details-section full-width">
            <span class="booking-details-label">Booking ID</span>
            <span class="booking-details-value" style="color: #FF9C00; font-weight: 700; font-size: 1.2rem;">${booking.bookingId || 'N/A'}</span>
        </div>
        <div class="booking-details-section">
            <span class="booking-details-label">Status</span>
            <span class="booking-details-value">
                <span class="status-select ${statusClass}" style="display: inline-block; padding: 0.4rem 1rem; border-radius: 20px; font-size: 0.85rem; font-weight: 600;">
                    ${getStatusText(booking.status)}
                </span>
            </span>
        </div>
        <div class="booking-details-section">
            <span class="booking-details-label">Total Amount</span>
            <span class="booking-details-value" style="color: #FF9C00; font-weight: 700; font-size: 1.3rem;">${booking.vetPrice || '10.00'} د</span>
        </div>
        <div class="booking-details-divider full-width"></div>
        <div class="booking-details-section">
            <span class="booking-details-label">Pet Information</span>
            <div style="display: flex; align-items: center; gap: 0.75rem; margin-top: 0.5rem;">
                <span class="pet-type-icon" style="width: 45px; height: 45px; background: #f5f5f5; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.3rem;">${getPetEmoji(booking.pettype || booking.petType)}</span>
                <div>
                    <span class="booking-details-value" style="font-size: 1.15rem; font-weight: 600;">${booking.petname || booking.petName || 'Unknown'}</span>
                    <br>
                    <span class="booking-details-value" style="color: #666; font-size: 0.95rem;">${booking.pettype || booking.petType || 'Unknown'}</span>
                </div>
            </div>
        </div>
        <div class="booking-details-section">
            <span class="booking-details-label">Owner Information</span>
            <span class="booking-details-value" style="margin-top: 0.3rem; font-weight: 600;">${booking.firstname || booking.firstName || ''} ${booking.lastname || booking.lastName || ''}</span>
            <span class="booking-details-value" style="color: #666; font-size: 0.9rem; margin-top: 0.3rem; display: block;">📧 ${booking.email || 'N/A'}</span>
            <span class="booking-details-value" style="color: #666; font-size: 0.9rem; display: block;">📞 ${booking.phone || '-'}</span>
        </div>
        <div class="booking-details-section">
            <span class="booking-details-label">Appointment Date</span>
            <span class="booking-details-value" style="font-size: 1.05rem; font-weight: 600;">${formatDate(booking.date)}</span>
        </div>
        <div class="booking-details-section">
            <span class="booking-details-label">Appointment Time</span>
            <span class="booking-details-value" style="font-size: 1.05rem; font-weight: 600;">${formatTime(booking.time || booking.timeSlot)}</span>
        </div>
        <div class="booking-details-section">
            <span class="booking-details-label">Reason for Visit</span>
            <span class="booking-details-value" style="font-size: 1.05rem;">${booking.reason || '-'}</span>
        </div>
        ${notes ? `
        <div class="booking-details-section full-width">
            <span class="booking-details-label">Pet Condition / Notes</span>
            <span class="booking-details-value" style="color: #666; font-size: 0.95rem; line-height: 1.6; margin-top: 0.5rem; padding: 1rem; background: #f9f9f9; border-radius: 8px; white-space: pre-wrap;">${notes}</span>
        </div>
        ` : ''}
        <div class="booking-details-status-actions">
            <h4>Change Status</h4>
            <div class="status-buttons-group">
                <button class="status-action-btn pending ${currentStatus === 'Pending' ? 'active' : ''}" 
                        onclick="changeBookingStatusFromModal('${booking.bookingId}', 'Pending')">
                    Awaiting Vet Confirmation
                </button>
                <button class="status-action-btn completed ${currentStatus === 'Completed' ? 'active' : ''}" 
                        onclick="changeBookingStatusFromModal('${booking.bookingId}', 'Completed')">
                    Confirmed
                </button>
                <button class="status-action-btn cancelled ${currentStatus === 'Cancelled' ? 'active' : ''}" 
                        onclick="changeBookingStatusFromModal('${booking.bookingId}', 'Cancelled')">
                    Cancelled
                </button>
            </div>
        </div>
    `;
    
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
}

// Store pending action
let pendingAction = {
    bookingId: null,
    newStatus: null
};

// Change booking status from modal - with confirmation
function changeBookingStatusFromModal(bookingId, newStatus) {
    pendingAction.bookingId = bookingId;
    pendingAction.newStatus = newStatus;
    
    // Show confirmation modal
    const confirmationModal = document.getElementById('confirmation-modal');
    const message = document.getElementById('confirmation-message');
    const actionBtn = document.getElementById('confirmation-action-btn');
    
    if (newStatus === 'Completed') {
        message.textContent = 'Are you sure you want to confirm this appointment?';
        actionBtn.textContent = 'Yes, Confirm';
        actionBtn.className = 'confirmation-btn confirm';
    } else if (newStatus === 'Cancelled') {
        message.textContent = 'Are you sure you want to reject this appointment?';
        actionBtn.textContent = 'Yes, Reject';
        actionBtn.className = 'confirmation-btn reject';
    } else {
        // For Pending, proceed directly
        proceedWithStatusChange(bookingId, newStatus);
        return;
    }
    
    confirmationModal.classList.add('show');
    document.body.style.overflow = 'hidden';
}

// Proceed with action after confirmation
function proceedWithAction() {
    const bookingId = pendingAction.bookingId;
    const newStatus = pendingAction.newStatus;
    const action = pendingAction.action;
    
    closeConfirmationModal();
    
    if (action === 'deleteSlot') {
        deleteSlot(bookingId);
        return;
    }
    
    if (newStatus === 'Cancelled') {
        // Show rejection reason modal
        showRejectionReasonModal(bookingId);
    } else if (newStatus === 'Completed') {
        // Directly confirm
        proceedWithStatusChange(bookingId, newStatus);
    }
}

// Show rejection reason modal
function showRejectionReasonModal(bookingId) {
    pendingAction.bookingId = bookingId;
    const rejectionModal = document.getElementById('rejection-reason-modal');
    const form = document.getElementById('rejection-reason-form');
    
    // Reset form
    form.reset();
    
    rejectionModal.classList.add('show');
    document.body.style.overflow = 'hidden';
}

// Submit rejection with reason
function submitRejection(event) {
    event.preventDefault();
    
    const bookingId = pendingAction.bookingId;
    const reason = document.getElementById('rejection-reason-select').value;
    const notes = document.getElementById('rejection-notes').value;
    
    if (!reason) {
        showToast('Please select a rejection reason', 'error');
        return;
    }
    
    // Update booking status
    if (updateBookingStatus(bookingId, 'Cancelled')) {
        // Store rejection reason and notes in booking
        const allBookings = getAllBookings();
        const bookingIndex = allBookings.findIndex(b => b.bookingId === bookingId);
        
        if (bookingIndex !== -1) {
            allBookings[bookingIndex].rejectionReason = reason;
            allBookings[bookingIndex].rejectionNotes = notes;
            localStorage.setItem('petopiaBookings', JSON.stringify(allBookings));
        }
        
        closeRejectionReasonModal();
        
        // Close booking details modal if open
        const bookingModal = document.getElementById('booking-details-modal');
        if (bookingModal.classList.contains('show')) {
            closeBookingDetailsModal();
        }
        
        // Update the select styling in table
        const selects = document.querySelectorAll('.status-select');
        selects.forEach(select => {
            select.className = 'status-select ' + getStatusClass(select.value);
        });
        
        // Reload bookings
        loadBookings();
        
        showToast('Appointment rejected successfully', 'success');
    }
}

// Proceed with status change (for non-rejection actions)
function proceedWithStatusChange(bookingId, newStatus) {
    if (updateBookingStatus(bookingId, newStatus)) {
        // Update the modal display if open
        const bookingModal = document.getElementById('booking-details-modal');
        if (bookingModal.classList.contains('show')) {
            viewBookingDetails(bookingId);
        }
        // Reload bookings table
        loadBookings();
    }
}

// Close confirmation modal
function closeConfirmationModal(event) {
    if (event && event.target !== event.currentTarget) {
        return;
    }
    const modal = document.getElementById('confirmation-modal');
    modal.classList.remove('show');
    document.body.style.overflow = '';
    pendingAction = { bookingId: null, newStatus: null };
}

// Close rejection reason modal
function closeRejectionReasonModal(event) {
    if (event && event.target !== event.currentTarget) {
        return;
    }
    const modal = document.getElementById('rejection-reason-modal');
    modal.classList.remove('show');
    document.body.style.overflow = '';
    pendingAction = { bookingId: null, newStatus: null };
}

// Close booking details modal
function closeBookingDetailsModal(event) {
    if (event && event.target !== event.currentTarget) {
        return;
    }
    const modal = document.getElementById('booking-details-modal');
    modal.classList.remove('show');
    document.body.style.overflow = '';
}

// Close modals when clicking outside
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('notes-modal')) {
        e.target.classList.remove('show');
    }
    if (e.target.classList.contains('booking-details-modal')) {
        closeBookingDetailsModal(e);
    }
    if (e.target.classList.contains('confirmation-modal')) {
        closeConfirmationModal(e);
    }
    if (e.target.classList.contains('rejection-reason-modal')) {
        closeRejectionReasonModal(e);
    }
});

