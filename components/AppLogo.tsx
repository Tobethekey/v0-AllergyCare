import Link from "next/link"

export function AppLogo() {
  return (
    <Link
      href="/"
      className="flex items-center gap-3 text-lg font-semibold hover:opacity-80 transition-opacity"
      aria-label="Zurück zum Dashboard"
    >
      <div className="relative w-8 h-8 flex-shrink-0">
        <svg
          width="32"
          height="32"
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
          aria-hidden="true"
        >
          {/* Schutzschild-Form als Basis */}
          <path
            d="M16 2L24 6V14C24 20.5 20.5 26 16 28C11.5 26 8 20.5 8 14V6L16 2Z"
            fill="#10B981"
            stroke="#059669"
            strokeWidth="1"
          />

          {/* Blatt-Symbol für natürliche Gesundheit */}
          <path
            d="M16 8C13.5 8 11.5 10 11.5 12.5C11.5 15 13.5 17 16 17C18.5 17 20.5 15 20.5 12.5C20.5 10 18.5 8 16 8Z"
            fill="#FFFFFF"
          />

          {/* Kleines Plus-Symbol für medizinische Versorgung */}
          <path d="M15 20H17V22H15V20ZM15 18H17V20H15V18Z" fill="#FFFFFF" />
          <path d="M14 19H18V21H14V19Z" fill="#FFFFFF" />
        </svg>
      </div>

      <span className="font-display text-foreground">AllergyCare</span>
    </Link>
  )
}
