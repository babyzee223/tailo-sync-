import React, { useState, useMemo } from 'react';
import { Calendar as CalendarIcon, Clock, CheckCircle, ChevronLeft, ChevronRight, Archive, AlertCircle, Eye } from 'lucide-react';
import type { Order } from '../types';
import CalendarEventModal from './CalendarEventModal';

type Props = {
  orders: Order[];
  onOrderUpdate?: (order: Order) => void;
};

type CalendarEvent = {
  id: string;
  title: string;
  date: Date;
  type: 'fitting' | 'pickup' | 'wedding';
  clientName: string;
  status: string;
  order: Order;
  fittingSession?: any;
};

const CalendarView: React.FC<Props> = ({ orders, onOrderUpdate }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [showArchiveConfirm, setShowArchiveConfirm] = useState<CalendarEvent | null>(null);

  const events = useMemo(() => {
    const allEvents: CalendarEvent[] = [];

    if (!Array.isArray(orders)) return allEvents;

    orders.forEach(order => {
      // Skip archived orders
      if (order.status === 'archived') return;

      // Add pickup date (due date) - preserve exact date
      const dueDate = new Date(order.dueDate);
      // Set time to 6 PM if not specified
      if (dueDate.getHours() === 0 && dueDate.getMinutes() === 0) {
        dueDate.setHours(18, 0, 0, 0);
      }

      allEvents.push({
        id: `pickup-${order.id}`,
        title: `Pickup: ${order.garments.map(g => g.garmentInfo.type).join(', ')}`,
        date: dueDate,
        type: 'pickup',
        clientName: order.clientInfo.name,
        status: order.status,
        order
      });

      // Add wedding dates and fittings
      order.garments.forEach(garment => {
        if (garment.garmentInfo.bridalInfo?.weddingDate) {
          // Wedding date - preserve exact date
          const weddingDate = new Date(garment.garmentInfo.bridalInfo.weddingDate);
          // Set time to noon if not specified
          if (weddingDate.getHours() === 0 && weddingDate.getMinutes() === 0) {
            weddingDate.setHours(12, 0, 0, 0);
          }

          allEvents.push({
            id: `wedding-${order.id}`,
            title: 'Wedding Day',
            date: weddingDate,
            type: 'wedding',
            clientName: order.clientInfo.name,
            status: order.status,
            order
          });
        }

        // Add fitting sessions
        garment.garmentInfo.bridalInfo?.fittingSessions.forEach((session, index) => {
          if (session.date) {
            // Preserve exact fitting date and time
            const fittingDate = new Date(session.date);
            allEvents.push({
              id: `fitting-${order.id}-${index}`,
              title: `${session.type} Fitting`,
              date: fittingDate,
              type: 'fitting',
              clientName: order.clientInfo.name,
              status: session.completed ? 'completed' : 'pending',
              order,
              fittingSession: session
            });
          }
        });
      });
    });

    return allEvents.sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [orders]);

  const handleArchiveEvent = (event: CalendarEvent) => {
    setShowArchiveConfirm(event);
  };

  const confirmArchive = () => {
    if (!showArchiveConfirm) return;

    const updatedOrder = {
      ...showArchiveConfirm.order,
      status: 'archived' as const,
      timeline: [
        ...showArchiveConfirm.order.timeline,
        {
          id: Date.now().toString(),
          type: 'status_change',
          timestamp: new Date().toISOString(),
          description: 'Order archived'
        }
      ]
    };

    onOrderUpdate?.(updatedOrder);
    setShowArchiveConfirm(null);
    setSelectedEvent(null);
  };

  const calendar = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // Get the first day of the month
    const firstDay = new Date(year, month, 1);
    // Get the last day of the month
    const lastDay = new Date(year, month + 1, 0);

    // Get the day of week for the first day (0-6, 0 = Sunday)
    const firstDayOfWeek = firstDay.getDay();

    // Calculate how many days we need from the previous month
    const daysFromPrevMonth = firstDayOfWeek;

    // Calculate total days needed (including prev/next month days)
    const totalDays = 42; // 6 rows × 7 days

    const days: Array<{ date: Date; isCurrentMonth: boolean; events: CalendarEvent[] }> = [];

    // Add days from previous month
    for (let i = daysFromPrevMonth - 1; i >= 0; i--) {
      const date = new Date(year, month, -i);
      days.push({
        date,
        isCurrentMonth: false,
        events: events.filter(event => 
          event.date.getFullYear() === date.getFullYear() &&
          event.date.getMonth() === date.getMonth() &&
          event.date.getDate() === date.getDate()
        )
      });
    }

    // Add days from current month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const date = new Date(year, month, i);
      days.push({
        date,
        isCurrentMonth: true,
        events: events.filter(event => 
          event.date.getFullYear() === date.getFullYear() &&
          event.date.getMonth() === date.getMonth() &&
          event.date.getDate() === date.getDate()
        )
      });
    }

    // Add days from next month
    const remainingDays = totalDays - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      const date = new Date(year, month + 1, i);
      days.push({
        date,
        isCurrentMonth: false,
        events: events.filter(event => 
          event.date.getFullYear() === date.getFullYear() &&
          event.date.getMonth() === date.getMonth() &&
          event.date.getDate() === date.getDate()
        )
      });
    }

    return days;
  }, [currentDate, events]);

  const getEventColor = (type: CalendarEvent['type'], status: string = '') => {
    switch (type) {
      case 'fitting':
        return status === 'completed' 
          ? 'bg-purple-100 text-purple-800 hover:bg-purple-200'
          : 'bg-purple-200 text-purple-900 hover:bg-purple-300';
      case 'pickup':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'wedding':
        return 'bg-pink-100 text-pink-800 hover:bg-pink-200';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleEventClick = (event: CalendarEvent, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the date selection
    setSelectedEvent(event);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm">
      {/* Calendar Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Calendar</h3>
          <div className="flex items-center space-x-4">
            <button
              onClick={prevMonth}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-lg font-medium">
              {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </span>
            <button
              onClick={nextMonth}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Week days header */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {weekDays.map(day => (
            <div key={day} className="text-center text-sm font-medium text-gray-500">
              {day}
            </div>
          ))}
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="p-4">
        <div className="grid grid-cols-7 gap-1">
          {calendar.map(({ date, isCurrentMonth, events }, index) => {
            const isToday = date.toDateString() === new Date().toDateString();
            const isSelected = selectedDate?.toDateString() === date.toDateString();

            return (
              <div
                key={index}
                onClick={() => setSelectedDate(date)}
                className={`
                  min-h-[100px] p-2 border rounded-lg cursor-pointer
                  ${isCurrentMonth ? 'bg-white' : 'bg-gray-50'}
                  ${isSelected ? 'ring-2 ring-blue-500' : ''}
                  ${isToday ? 'border-blue-500' : 'border-gray-200'}
                `}
              >
                <div className="text-right mb-1">
                  <span className={`text-sm ${isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}`}>
                    {date.getDate()}
                  </span>
                </div>
                <div className="space-y-1">
                  {events.map(event => (
                    <button
                      key={event.id}
                      onClick={(e) => handleEventClick(event, e)}
                      className={`w-full text-left px-2 py-1 rounded-md text-xs font-medium ${getEventColor(event.type, event.status)} transition-colors`}
                      title={`${event.title} - ${event.clientName} - ${event.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                    >
                      <div className="truncate">
                        {event.title.length > 15 ? `${event.title.slice(0, 15)}...` : event.title}
                      </div>
                      <div className="text-xs opacity-75 truncate">
                        {event.clientName} - {event.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Date Events */}
      {selectedDate && (
        <div className="p-4 border-t">
          <h4 className="font-medium text-gray-900 mb-3">
            Events for {selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </h4>
          <div className="space-y-2">
            {events.filter(event => 
              event.date.getFullYear() === selectedDate.getFullYear() &&
              event.date.getMonth() === selectedDate.getMonth() &&
              event.date.getDate() === selectedDate.getDate()
            ).map(event => (
              <div
                key={event.id}
                className={`w-full p-3 rounded-lg ${getEventColor(event.type, event.status)} transition-colors`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{event.title}</p>
                    <p className="text-sm text-gray-600">{event.clientName}</p>
                    <p className="text-sm text-gray-600">
                      {event.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {event.type === 'fitting' && (
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        event.status === 'completed'
                          ? 'bg-green-200 text-green-800'
                          : 'bg-yellow-200 text-yellow-800'
                      }`}>
                        {event.status === 'completed' ? 'Completed' : 'Scheduled'}
                      </span>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEventClick(event, e);
                      }}
                      className="p-1 hover:bg-black/10 rounded"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleArchiveEvent(event);
                      }}
                      className="p-1 hover:bg-black/10 rounded"
                      title="Archive Event"
                    >
                      <Archive className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Event Details Modal */}
      {selectedEvent && (
        <CalendarEventModal
          event={selectedEvent}
          isOpen={true}
          onClose={() => setSelectedEvent(null)}
          onUpdate={onOrderUpdate}
        />
      )}

      {/* Archive Confirmation Modal */}
      {showArchiveConfirm && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full m-4">
            <div className="flex items-start mb-4">
              <div className="bg-red-50 p-2 rounded-lg">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Archive Event</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Are you sure you want to archive this event? This will archive the entire order and hide it from the calendar.
                </p>
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <p className="font-medium">{showArchiveConfirm.title}</p>
              <p className="text-sm text-gray-600">{showArchiveConfirm.clientName}</p>
              <p className="text-sm text-gray-600">
                {showArchiveConfirm.date.toLocaleString()}
              </p>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowArchiveConfirm(null)}
                className="px-4 py-2 text-gray-700 hover:text-gray-900"
              >
                Cancel
              </button>
              <button
                onClick={confirmArchive}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Archive Event
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarView;