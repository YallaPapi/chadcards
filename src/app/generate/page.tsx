import GenerateForm from '@/components/GenerateForm'

export default function GeneratePage() {
  return (
    <div>
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold mb-2" style={{ color: '#c9a94e' }}>
          Card Generator
        </h1>
        <p className="text-gray-500">Type any public figure&apos;s name and we&apos;ll generate their card</p>
      </div>
      <GenerateForm />
    </div>
  )
}
