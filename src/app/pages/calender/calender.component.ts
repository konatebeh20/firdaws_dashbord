import { KeyValuePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FullCalendarComponent, FullCalendarModule } from '@fullcalendar/angular';
import { Component, ViewChild } from '@angular/core';
import { EventInput, CalendarOptions, DateSelectArg, EventClickArg } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { ModalComponent } from '../../shared/components/ui/modal/modal.component';

interface CalendarEvent extends EventInput {
  id?: string;
  extendedProps: {
    calendar: string;
    type?: string;
    description?: string;
  };
}

@Component({
  selector: 'app-calender',
  imports: [
    FormsModule,
    KeyValuePipe,
    FullCalendarModule,
    ModalComponent
  ],
  templateUrl: './calender.component.html',
  styles: ``
})
export class CalenderComponent {

  @ViewChild('calendar') calendarComponent!: FullCalendarComponent;

  events: CalendarEvent[] = [];
  selectedEvent: CalendarEvent | null = null;
  
  // Propriétés du formulaire
  eventTitle: string = '';
  eventType: string = '';
  eventDescription: string = '';
  eventStartDate: string = '';
  eventEndDate: string = '';
  eventLevel: string = '';
  isOpen: boolean = false;

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

  ngOnInit() {
    this.events = [
      {
        id: '1',
        title: 'Prière du Vendredi',
        start: this.getNextFriday().toISOString().slice(0, 16),
        extendedProps: { 
          calendar: 'Prière',
          type: 'priere',
          description: 'Prière du vendredi à la mosquée'
        }
      },
      {
        id: '2',
        title: 'Cours de Coran',
        start: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
        extendedProps: { 
          calendar: 'Cours',
          type: 'cours',
          description: 'Apprentissage du Saint Coran'
        }
      },
      {
        id: '3',
        title: 'Conférence Islamique',
        start: new Date(Date.now() + 172800000).toISOString().slice(0, 16),
        end: new Date(Date.now() + 259200000).toISOString().slice(0, 16),
        extendedProps: { 
          calendar: 'Conférence',
          type: 'conference',
          description: 'Conférence sur les enseignements islamiques'
        }
      }
    ];

    this.calendarOptions = {
      plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
      initialView: 'dayGridMonth',
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
      eventContent: (arg) => this.renderEventContent(arg)
    };
  }

  // Fonction pour obtenir le prochain vendredi
  getNextFriday(): Date {
    const date = new Date();
    const day = date.getDay();
    const daysUntilFriday = (5 - day + 7) % 7;
    date.setDate(date.getDate() + daysUntilFriday);
    date.setHours(12, 0, 0, 0); // Midi pour la prière du vendredi
    return date;
  }

  handleDateSelect(selectInfo: DateSelectArg) {
    this.resetModalFields();
    // Formater la date pour datetime-local
    this.eventStartDate = selectInfo.startStr.slice(0, 16);
    this.eventEndDate = selectInfo.endStr ? selectInfo.endStr.slice(0, 16) : this.eventStartDate;
    this.openModal();
  }

  handleEventClick(clickInfo: EventClickArg) {
    const event = clickInfo.event;
    this.selectedEvent = {
      id: event.id,
      title: event.title,
      start: event.startStr,
      end: event.endStr,
      extendedProps: event.extendedProps as any
    };
    
    // Remplir le formulaire avec les données de l'événement
    this.eventTitle = event.title;
    this.eventType = event.extendedProps?.['type'] || '';
    this.eventDescription = event.extendedProps?.['description'] || '';
    this.eventStartDate = event.startStr.slice(0, 16);
    this.eventEndDate = event.endStr ? event.endStr.slice(0, 16) : this.eventStartDate;
    this.eventLevel = event.extendedProps?.['calendar'] || '';
    
    this.openModal();
  }

  handleAddOrUpdateEvent() {
    // Validation des champs requis
    if (!this.eventTitle || !this.eventType || !this.eventStartDate || !this.eventEndDate) {
      console.error('Veuillez remplir tous les champs requis');
      alert('Veuillez remplir tous les champs requis (Titre, Type, Date de début et Date de fin)');
      return;
    }
    
    if (this.selectedEvent && this.selectedEvent.id) {
      // Logique de mise à jour
      this.updateEvent(this.selectedEvent.id, {
        title: this.eventTitle,
        start: this.eventStartDate,
        end: this.eventEndDate,
        extendedProps: {
          calendar: this.eventLevel,
          type: this.eventType,
          description: this.eventDescription
        }
      });
    } else {
      // Logique d'ajout
      this.addNewEvent({
        title: this.eventTitle,
        start: this.eventStartDate,
        end: this.eventEndDate,
        extendedProps: {
          calendar: this.eventLevel,
          type: this.eventType,
          description: this.eventDescription
        }
      });
    }
    
    this.closeModal();
  }

  addNewEvent(eventData: any) {
    const newEvent: CalendarEvent = {
      id: Date.now().toString(),
      title: eventData.title,
      start: eventData.start,
      end: eventData.end,
      allDay: false,
      extendedProps: {
        calendar: eventData.extendedProps.calendar,
        type: eventData.extendedProps.type,
        description: eventData.extendedProps.description
      }
    };
    this.events = [...this.events, newEvent];
    this.calendarOptions.events = this.events;
    
    // Rafraîchir le calendrier
    if (this.calendarComponent) {
      this.calendarComponent.getApi().refetchEvents();
    }
  }

  updateEvent(eventId: string, eventData: any) {
    this.events = this.events.map(ev =>
      ev.id === eventId
        ? {
            ...ev,
            title: eventData.title,
            start: eventData.start,
            end: eventData.end,
            extendedProps: eventData.extendedProps
          }
        : ev
    );
    this.calendarOptions.events = this.events;
    
    // Rafraîchir le calendrier
    if (this.calendarComponent) {
      this.calendarComponent.getApi().refetchEvents();
    }
  }

  resetModalFields() {
    this.eventTitle = '';
    this.eventType = '';
    this.eventDescription = '';
    this.eventStartDate = '';
    this.eventEndDate = '';
    this.eventLevel = '';
    this.selectedEvent = null;
  }

  openModal() {
    this.isOpen = true;
  }

  closeModal() {
    this.isOpen = false;
    this.resetModalFields();
  }

  resetForm() {
    this.resetModalFields();
  }

  renderEventContent(eventInfo: any) {
    const calendarName = eventInfo.event.extendedProps?.['calendar'] || 'Autre';
    const colorClass = `fc-bg-${calendarName.toLowerCase()}`;
    const typeIcon = this.getEventTypeIcon(eventInfo.event.extendedProps?.['type']);
    
    return {
      html: `
        <div class="event-fc-color flex fc-event-main ${colorClass} p-1 rounded-sm">
          <div class="fc-daygrid-event-dot"></div>
          <div class="fc-event-time">${eventInfo.timeText || ''}</div>
          <div class="fc-event-title">${typeIcon} ${eventInfo.event.title}</div>
        </div>
      `
    };
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
}