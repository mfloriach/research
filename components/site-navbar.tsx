import Image from "next/image";

export type SiteNavbarMenuItem = {
  id: string;
  label: string;
  href: string;
};

export type SiteNavbarProps = {
  brand: string;
  search: {
    placeholder: string;
    label: string;
  };
  avatar: {
    src: string;
    alt: string;
  };
  menu: {
    label: string;
    items: SiteNavbarMenuItem[];
  };
};

/**
 * Top navigation bar: brand, search field and an avatar that opens a menu.
 *
 * The menu is a daisyUI dropdown built on `<details>` so it works without
 * shipping any client-side JavaScript.
 */
export function SiteNavbar({ brand, search, avatar, menu }: SiteNavbarProps) {
  return (
    <header className="navbar sticky top-0 z-40 bg-base-100 px-4 shadow-sm sm:px-6">
      <div className="navbar-start">
        <a className="btn btn-ghost px-2 text-lg sm:text-xl">{brand}</a>
      </div>

      <div className="navbar-end gap-2">
        <label className="input w-36 sm:w-72">
          <svg
            className="h-[1em] opacity-50"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <g
              strokeLinejoin="round"
              strokeLinecap="round"
              strokeWidth="2.5"
              fill="none"
              stroke="currentColor"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </g>
          </svg>
          <input
            type="search"
            required
            placeholder={search.placeholder}
            aria-label={search.label}
            className="grow"
          />
        </label>

        <div className="dropdown dropdown-end">
          <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
            <div className="w-10 rounded-full">
              <Image src={avatar.src} alt={avatar.alt} width={40} height={40} />
            </div>
          </div>
          <ul
            tabIndex={-1}
            className="menu dropdown-content z-1 mt-3 w-52 rounded-box bg-base-100 p-2 shadow"
          >
            <li>
              <span className="menu-title">{menu.label}</span>
            </li>
            {menu.items.map((item) => (
              <li key={item.id}>
                <a href={item.href}>{item.label}</a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </header>
  );
}
