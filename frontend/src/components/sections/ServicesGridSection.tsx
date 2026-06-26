import Image from "next/image";

type Service = {
  name: string;
  icon: string;
};

const services: Service[] = [
  {
    name: "Instant Courier",
    icon: "streamline-ultimate_delivery-package-person-bold.svg",
  },
  {
    name: "Domestic",
    icon: "material-symbols-light_delivery-truck-speed.svg",
  },
  {
    name: "International Courier",
    icon: "mdi_airplane-marker.svg",
  },
  {
    name: "Transshipment Service",
    icon: "streamline-ultimate_shipment-cargo-boat-bold.svg",
  },
  {
    name: "Food Delivery",
    icon: "famicons_fast-food-sharp.svg",
  },
  {
    name: "Liquor Delivery",
    icon: "ic_sharp-liquor.svg",
  },
  {
    name: "E-commerce Delivery",
    icon: "streamline-ultimate_mobile-shopping-cart-exchange-bold.svg",
  },
  {
    name: "Bike Ride",
    icon: "fluent_vehicle-motorcycle-48-filled.svg",
  },
  {
    name: "Taxi Ride",
    icon: "ic_sharp-local-taxi.svg",
  },
  {
    name: "Vehicle Rent",
    icon: "maki_car-rental.svg",
  },
];

export function ServicesGridSection() {
  return (
    <section className="bg-[var(--color-accent-soft)] py-20 lg:py-24">
      <div className="container-content">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5 lg:gap-6">
          {services.map((service) => (
            <article
              key={service.name}
              className="bg-white rounded-[var(--radius-lg)] py-8 px-4 flex flex-col items-center justify-center text-center shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-lg)] transition-shadow"
            >
              <div className="relative w-14 h-14 lg:w-16 lg:h-16">
                <Image
                  src={`/images/services-svg/${service.icon}`}
                  alt=""
                  fill
                  sizes="64px"
                  className="object-contain"
                />
              </div>
              <h3 className="mt-5 text-[15px] lg:text-[16px] font-bold text-[var(--color-text)] leading-snug">
                {service.name}
              </h3>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
