
// import { Facebook, Twitter, Instagram, Youtube } from "lucide-react";

const socials = ["Facebook", "Twitter", "Instagram", "Youtube"]

const links = {
  Company: ["About Us", "Careers", "Press", "Blog"],
  Support: ["Help Center", "Safety", "Terms", "Privacy"],
  Explore: ["Cities", "Fleet", "Deals", "Partners"],
};

export function Footer() {
  return (
    <footer className="bg-black/90 text-white/80 pt-16 pb-8" id="contact">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          <div>
            <h3 className="text-xl font-bold font-display text-white mb-4">
              Drive<span className="text-gradient">X</span>
            </h3>
            <p className="text-sm leading-relaxed text-white/50">
              Premium car rentals for every journey. Fast, reliable, and always at your service.
            </p>
            <div className="flex gap-3 mt-6">
              {socials.map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-9 h-9    bg-white/90 flex items-center justify-center hover:bg-white/20 transition-colors"
                >
                  {/* <Icon size={16} /> */}
                  Icon

                </a>
              ))}
            </div>
          </div>

          {Object.entries(links).map(([category, items]) => (
            <div key={category}>
              <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">{category}</h4>
              <ul className="space-y-2.5">
                {items.map((item) => (
                  <li key={item}>
                    <a href="#" className="text-sm text-white/50 hover:text-white transition-colors">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-white/10 pt-8 text-center">
          <p className="text-xs text-white/40">
            © {new Date().getFullYear()} DriveX. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
