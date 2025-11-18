import React from 'react';

export type IconType = 'logo' | 'gear' | 'code' | 'eye' | 'download' | 'upload' | 'loader' | 'image' | 'chip' | 'chat' | 'send' | 'xMark' | 'sparkles' | 'pencil' | 'trash' | 'plus' | 'search' | 'info' | 'minus' | 'viewfinder' | 'server';

interface IconProps extends React.SVGProps<SVGSVGElement> {
  name: IconType;
}

const iconPaths: Record<IconType, React.ReactNode> = {
    logo: (
        <>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 3.535a3 3 0 014.243 0l6.363 6.364a3 3 0 010 4.242L13.243 20.5a3 3 0 01-4.243 0L2.636 14.136a3 3 0 010-4.242L9 3.535z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 7.5l-4.5 4.5 -4.5-4.5" />
        </>
    ),
    gear: <path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-1.007 1.11-1.212l2.29-.812a1.875 1.875 0 011.888 1.888l-.812 2.29a1.875 1.875 0 01-1.212 1.11M10.343 3.94L9 6.236m1.343-2.296l-1.343 2.296m0 0L9 6.236m2.29-2.812l-2.29 2.812m0 0l2.29 2.812M12 12a2.25 2.25 0 00-2.25 2.25 2.25 2.25 0 002.25 2.25 2.25 2.25 0 002.25-2.25A2.25 2.25 0 0012 12zm-3.125 4.125a1.875 1.875 0 01-1.11-1.212l-.812-2.29a1.875 1.875 0 011.888-1.888l2.29.812a1.875 1.875 0 011.212 1.11M13.657 16.06L15 13.764m-1.343 2.296l1.343-2.296m0 0L15 13.764m-2.29 2.812l2.29-2.812m0 0l-2.29-2.812" />,
    code: <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25" />,
    eye: (<><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.432 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></>),
    download: <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />,
    upload: <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />,
    loader: <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />,
    image: <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />,
    chip: <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3.75H19.5a.75.75 0 01.75.75v11.25a.75.75 0 01-.75.75H8.25a.75.75 0 01-.75-.75V4.5a.75.75 0 01.75-.75zM8.25 3.75L6.75 5.25v10.5L8.25 17.25m0-13.5L9.75 5.25m-1.5-1.5L8.25 6m-1.5-2.25L5.25 5.25m1.5-1.5L6.75 6m1.5-2.25L8.25 7.5m-1.5-1.5L6.75 9m1.5-1.5L8.25 10.5m-1.5-1.5L6.75 12m1.5-1.5L8.25 13.5m-1.5-1.5L6.75 15m1.5-1.5L8.25 16.5m-1.5-1.5L6.75 18m13.5-12.75l1.5-1.5m-1.5 1.5l-1.5-1.5m1.5 1.5l1.5 1.5m-1.5-1.5l-1.5 1.5m1.5 1.5l1.5-1.5m-1.5 1.5l-1.5-1.5m1.5 3l1.5-1.5m-1.5 1.5l-1.5-1.5m1.5 1.5l1.5 1.5m-1.5-1.5l-1.5 1.5m1.5 1.5l1.5-1.5m-1.5 1.5l-1.5-1.5m1.5 3l1.5-1.5m-1.5 1.5l-1.5-1.5m1.5 1.5l1.5 1.5m-1.5-1.5l-1.5 1.5" />,
    chat: <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193l-3.72 3.72a1.125 1.125 0 01-1.59 0l-3.72-3.72a2.122 2.122 0 01-1.98-2.193v-4.286c0-.97.616-1.813 1.5-2.097m6.75-3.618c.25.035.488.16.676.36l.676.676a.75.75 0 010 1.06l-2.25 2.25a.75.75 0 01-1.06 0l-.676-.676a.75.75 0 010-1.06l2.25-2.25zM10.5 6.375a2.25 2.25 0 100 4.5 2.25 2.25 0 000-4.5zM3.75 6.375a2.25 2.25 0 100 4.5 2.25 2.25 0 000-4.5z" />,
    send: <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />,
    xMark: <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />,
    sparkles: <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM18 15.75l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 18l-1.035.259a3.375 3.375 0 00-2.456 2.456L18 21.75l-.259-1.035a3.375 3.375 0 00-2.456-2.456L14.25 18l1.035-.259a3.375 3.375 0 002.456-2.456z" />,
    pencil: <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />,
    trash: <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />,
    plus: <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />,
    search: <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />,
    info: <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />,
    minus: <path strokeLinecap="round" strokeLinejoin="round" d="M18 12H6" />,
    viewfinder: <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 10l-4 4m0 0v-3m0 3h3m7-7l4-4m0 0h-3m3 0v3" />,
    server: <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h6.375M9 12h6.375m-6.375 5.25h6.375M3.75 6.75h.008v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.008v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 17.25h.008v.008H3.75v-1.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />,
};


export const Icon: React.FC<IconProps> = ({ name, className = 'h-6 w-6', ...props }) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className={className}
            {...props}
        >
            {iconPaths[name]}
        </svg>
    );
};