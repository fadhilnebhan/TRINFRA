import { Maximize, TrendingUp, Grid, ShieldCheck } from 'lucide-react';

const benefits = [
  {
    icon: <Maximize className="text-olive w-6 h-6" />,
    title: "Unlocking Scale",
    description: "Combining smaller parcels creates a unified site capable of supporting larger, more institutional-grade developments."
  },
  {
    icon: <TrendingUp className="text-olive w-6 h-6" />,
    title: "Stronger Potential",
    description: "Larger sites often unlock better zoning allowances, increased density, and higher ultimate valuation yields."
  },
  {
    icon: <Grid className="text-olive w-6 h-6" />,
    title: "Coordinated Planning",
    description: "Enables comprehensive master-planning for infrastructure, ensuring efficient land use and municipal alignment."
  },
  {
    icon: <ShieldCheck className="text-olive w-6 h-6" />,
    title: "Marketability",
    description: "A consolidated, de-risked site is significantly more attractive to institutional developers and tier-one investors."
  }
];

export default function WhyPoolLand() {
  return (
    <section className="py-16 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h2 className="text-3xl mb-4">The Strategic Value of Pooling</h2>
          <p className="text-gray-600 max-w-2xl text-lg">
            Fragmented ownership limits development capacity. Pooling transforms adjacent lots into viable infrastructure assets.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((benefit, index) => (
            <div key={index} className="bg-surface p-8 border border-gray-200 rounded-sm hover:border-gray-300 transition-colors">
              <div className="mb-5 bg-background inline-block p-3 border border-gray-100 rounded-sm">
                {benefit.icon}
              </div>
              <h3 className="text-xl mb-3">{benefit.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
