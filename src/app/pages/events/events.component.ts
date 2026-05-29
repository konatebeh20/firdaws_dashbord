import { KeyValuePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FullCalendarComponent, FullCalendarModule } from '@fullcalendar/angular';
import { Component, OnInit, ViewChild } from '@angular/core';
import { EventInput, CalendarOptions, DateSelectArg, EventClickArg } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { ModalComponent } from '../../shared/components/ui/modal/modal.component';
import { EventsService, Event } from '../../shared/services/events/events.service';

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [FormsModule, KeyValuePipe, FullCalendarModule, ModalComponent],
  templateUrl: './events.component.html',
  styleUrl: './events.component.css'
})
export class EventsComponent implements OnInit {
  @ViewChild('calendar') calendarComponent!: FullCalendarComponent;

  events: EventInput[] = [];
  selectedEvent: Event | null = null;

  // Propriétés du formulaire
  eventTitle: string = '';
  eventType: string = '';
  eventDescription: string = '';
  eventStartDate: string = '';
  eventEndDate: string = '';
  eventLevel: string = '';
  eventLocation: string = '';
  isOpen: boolean = false;
  isLoading: boolean = false;
  toast: { message: string; type: 'success' | 'error' } | null = null;

  // Couleurs adaptées pour une mosquée
  calendarsEvents: Record<string, string> = {
    'Prière': 'primary',
    'Cours': 'success',
    'Conférence': 'warning',
    'Iftar': 'danger',
    'Aïd': 'info',
    'Autre': 'secondary'
  };

  calendarOptions!: CalendarOptions;

  constructor(private eventsService: EventsService) {}

  ngOnInit() {
    this.loadEvents();
    this.initCalendar();
  }

  loadEvents() {
    this.isLoading = true;
    this.eventsService.getEvents().subscribe({
      next: (data) => {
        this.events = data.map(event => ({
          id: event.id?.toString(),
          title: event.title,
          start: event.event_date,
          end: event.end_date,
          extendedProps: {
            calendar: this.getCategoryColorName(event.category),
            type: event.category,
            description: event.description,
            location: event.location
          }
        }));
        if (this.calendarOptions) {
          this.calendarOptions.events = this.events;
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur:', error);
        this.isLoading = false;
        this.showToast('Erreur de chargement', 'error');
      }
    });
  }

  initCalendar() {
    this.calendarOptions = {
      plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
      initialView: 'dayGridMonth',
      locale: 'fr',
      headerToolbar: {
        left: 'prev,next addEventButton',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay'
      },
      selectable: true,
      events: this.events,
      select: (info) => this.handleDateSelect(info),
      eventClick: (info) => this.handleEventClick(info),
      customButtons: {
        addEventButton: {
          text: '+ Ajouter un événement',
          click: () => this.openModal()
        }
      },
      buttonText: {
        today: 'Aujourd\'hui',
        month: 'Mois',
        week: 'Semaine',
        day: 'Jour'
      },
      eventContent: (arg) => this.renderEventContent(arg)
    };
  }

  getCategoryColorName(category: string): string {
    const mapping: Record<string, string> = {
      priere: 'Prière',
      cours: 'Cours',
      conference: 'Conférence',
      iftar: 'Iftar',
      aid: 'Aïd',
      autre: 'Autre'
    };
    return mapping[category] || 'Autre';
  }

  getCategoryColor(category: string): string {
    const colors: Record<string, string> = {
      priere: '#10B981',
      cours: '#3B82F6',
      conference: '#F59E0B',
      iftar: '#EF4444',
      aid: '#8B5CF6',
      autre: '#6B7280'
    };
    return colors[category] || '#6B7280';
  }

  getEventTypeIcon(type: string): string {
    const icons: Record<string, string> = {
      priere: '🕌',
      cours: '📖',
      conference: '🎙️',
      iftar: '🍽️',
      aid: '⭐',
      autre: '📌'
    };
    return icons[type] || '📅';
  }

  getNextFriday(): Date {
    const date = new Date();
    const day = date.getDay();
    const daysUntilFriday = (5 - day + 7) % 7;
    date.setDate(date.getDate() + daysUntilFriday);
    date.setHours(12, 0, 0, 0);
    return date;
  }

  handleDateSelect(selectInfo: DateSelectArg) {
    this.resetModalFields();
    this.eventStartDate = selectInfo.startStr.slice(0, 16);
    this.eventEndDate = selectInfo.endStr ? selectInfo.endStr.slice(0, 16) : this.eventStartDate;
    this.openModal();
  }

  handleEventClick(clickInfo: EventClickArg) {
    const event = clickInfo.event;
    const eventId = parseInt(event.id);

    this.eventsService.getEvent(eventId).subscribe({
      next: (fullEvent) => {
        if (fullEvent) {
          this.selectedEvent = fullEvent;
          this.eventTitle = fullEvent.title;
          this.eventType = fullEvent.category;
          this.eventDescription = fullEvent.description;
          this.eventStartDate = fullEvent.event_date.slice(0, 16);
          this.eventEndDate = fullEvent.end_date ? fullEvent.end_date.slice(0, 16) : this.eventStartDate;
          this.eventLevel = this.getCategoryColorName(fullEvent.category);
          this.eventLocation = fullEvent.location;
          this.openModal();
        }
      }
    });
  }

  handleAddOrUpdateEvent() {
    if (!this.eventTitle || !this.eventType || !this.eventStartDate || !this.eventEndDate) {
      this.showToast('Veuillez remplir tous les champs requis', 'error');
      return;
    }

    const eventData: Partial<Event> = {
      title: this.eventTitle,
      category: this.eventType,
      description: this.eventDescription,
      event_date: this.eventStartDate,
      end_date: this.eventEndDate,
      location: this.eventLocation || 'Mosquée'
    };

    if (this.selectedEvent && this.selectedEvent.id) {
      this.eventsService.updateEvent(this.selectedEvent.id, eventData).subscribe({
        next: () => {
          this.loadEvents();
          this.showToast('Événement mis à jour ✓');
          this.closeModal();
        },
        error: () => this.showToast('Erreur lors de la mise à jour', 'error')
      });
    } else {
      this.eventsService.createEvent(eventData).subscribe({
        next: () => {
          this.loadEvents();
          this.showToast('Événement ajouté ✓');
          this.closeModal();
        },
        error: () => this.showToast('Erreur lors de la création', 'error')
      });
    }
  }

  resetModalFields() {
    this.selectedEvent = null;
    this.eventTitle = '';
    this.eventType = '';
    this.eventDescription = '';
    this.eventStartDate = '';
    this.eventEndDate = '';
    this.eventLevel = '';
    this.eventLocation = '';
  }

  openModal() {
    this.isOpen = true;
  }

  closeModal() {
    this.isOpen = false;
    this.resetModalFields();
  }

  private showToast(message: string, type: 'success' | 'error' = 'success') {
    this.toast = { message, type };
    setTimeout(() => this.toast = null, 3500);
  }

  renderEventContent(eventInfo: any) {
    const typeIcon = this.getEventTypeIcon(eventInfo.event.extendedProps?.['type']);
    const categoryColor = this.getCategoryColor(eventInfo.event.extendedProps?.['type']);
    
    return {
      html: `
        <div class="event-fc-color flex fc-event-main p-1 rounded-sm" style="background-color: ${categoryColor}20; border-left: 3px solid ${categoryColor}">
          <div class="fc-daygrid-event-dot"></div>
          <div class="fc-event-title flex items-center gap-1">${typeIcon} ${eventInfo.event.title}</div>
        </div>
      `
    };
  }
}