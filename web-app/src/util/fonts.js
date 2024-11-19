import { Work_Sans,Inter ,} from 'next/font/google';

export const work_sans_init = Work_Sans({
    subsets: ['latin'],
    display:'swap',
    variable:'--font-work_sans',
    weight:'400'
})

export const work_sans = work_sans_init.className; 