import EventsGenerator from '@/components/EventsGenerator'

export default function EventsPage() {
  return (
    <div>
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold mb-2" style={{ color: '#c9a94e' }}>
          Breaking News Cards
        </h1>
        <p className="text-gray-500">Generate cards from today&apos;s biggest news events</p>
      </div>
      <EventsGenerator />
    </div>
  )
}
