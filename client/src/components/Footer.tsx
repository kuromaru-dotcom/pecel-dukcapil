import { MessageCircle, Facebook, Instagram } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-background border-t mt-8">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left">
            <p className="text-sm text-muted-foreground">
              © 2025 DISDUKCAPIL Kota Kotamobagu
            </p>
            <p className="text-xs text-muted-foreground/80">
              Dinas Kependudukan dan Pencatatan Sipil
            </p>
          </div>

          <div className="flex items-center gap-3">
            <p className="text-sm font-medium text-foreground mr-2">
              Hubungi Kami:
            </p>
            
            <a
              href="https://wa.me/6281242932303"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 h-11 bg-green-500 hover-elevate active-elevate-2 text-white rounded-full transition-all"
              data-testid="link-whatsapp"
            >
              <MessageCircle className="w-4 h-4" />
              <span className="hidden sm:inline">WhatsApp</span>
            </a>

            <a
              href="https://www.facebook.com/share/1YHXB51NkC/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 h-11 bg-blue-600 hover-elevate active-elevate-2 text-white rounded-full transition-all"
              data-testid="link-facebook"
            >
              <Facebook className="w-4 h-4" />
              <span className="hidden sm:inline">Facebook</span>
            </a>

            <a
              href="https://www.instagram.com/disdukcapil_kk?igsh=OWU2dWExd2x5dWY3"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 h-11 bg-gradient-to-br from-purple-600 to-pink-500 hover-elevate active-elevate-2 text-white rounded-full transition-all"
              data-testid="link-instagram"
            >
              <Instagram className="w-4 h-4" />
              <span className="hidden sm:inline">Instagram</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
