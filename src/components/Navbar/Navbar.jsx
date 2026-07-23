import StaggeredMenu from '../StaggeredMenu/StaggeredMenu';
import logo from '../../assets/img/octal-logo-withText.png';

const NAV_ITEMS = [
  { label: 'Home', ariaLabel: 'Go to home section', link: '/#home' },
  { label: 'About', ariaLabel: 'About Octal Philippines', link: '/#about' },
  { label: 'Solutions', ariaLabel: 'Explore our solutions', link: '/#solutions' },
  { label: 'Connect', ariaLabel: 'Contact us', link: '/#connect' },
  { label: 'Insights', ariaLabel: 'Read our insights', link: '/#insights' },
  { label: 'Careers', ariaLabel: 'View open positions', link: '/#jobs' },
];

const SOCIAL_ITEMS = [
  { label: 'LinkedIn', link: 'https://www.linkedin.com/' },
  { label: 'Facebook', link: 'https://www.facebook.com/' },
];

export default function Navbar() {
  return (
    <StaggeredMenu
      position="right"
      isFixed
      items={NAV_ITEMS}
      socialItems={SOCIAL_ITEMS}
      displaySocials={false}
      displayItemNumbering
      logoUrl={logo}
      menuButtonColor="#ffffff"
      openMenuButtonColor="#0a0f0d"
      changeMenuColorOnOpen
      colors={['#ffffff', '#f4f6f2']}
      accentColor="#59a14a"
      closeOnClickAway
    />
  );
}
