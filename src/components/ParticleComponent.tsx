import { StarModeContext } from '@/contexts/StarMode';
import { useContext } from 'react';
import Particles from 'react-particles-js';

const ParticleComponent = () => {
  const { starMode } = useContext(StarModeContext);
  return (
    <div
      style={{
        position: `fixed`,
        top: 0,
        left: 0,
        width: `100vw`,
        height: `100vh`,
        zIndex: 0,
        backgroundColor: `black`,
      }}
    >
      <Particles
        height="100vh"
        width="100vw"
        params={{
          particles: {
            number: {
              value: starMode ? 400 : 50,
            },
            color: {
              value: `#ffffff`,
            },
            shape: {
              type: `image`,
              stroke: {
                width: 0,
                color: `#000000`,
              },
              polygon: {
                nb_sides: 5,
              },
              image: {
                src: `/star.png`,
                width: 100,
                height: 100,
              },
            },
            opacity: {
              value: 1,
              random: false,
              anim: {
                enable: true,
                speed: 0.5,
                opacity_min: 0.1,
                sync: false,
              },
            },
            size: {
              value: 30,
              random: true,
              anim: {
                enable: true,
                speed: 20,
                size_min: 0.1,
                sync: false,
              },
            },
            line_linked: {
              enable: false,
              distance: 300,
              color: `#ffffff`,
              opacity: 0.4,
              width: 2,
            },
            move: {
              enable: true,
              speed: starMode ? 5 : 0.3,
              direction: `none`,
              random: false,
              straight: false,
              out_mode: `out`,
              bounce: false,
              attract: {
                enable: false,
                rotateX: 600,
                rotateY: 1200,
              },
            },
          },
          // interactivity: {
          //   detect_on: 'window',
          //   events: {
          //     onhover: {
          //       enable: true,
          //       mode: 'grab',
          //     },
          //     onclick: {
          //       enable: true,
          //       mode: 'push',
          //     },
          //     resize: true,
          //   },
          //   modes: {
          //     grab: {
          //       distance: 800,
          //       line_linked: {
          //         opacity: 1,
          //       },
          //     },
          //     bubble: {
          //       distance: 800,
          //       size: 80,
          //       duration: 2,
          //       opacity: 0.8,
          //       // speed: 3,
          //     },
          //     repulse: {
          //       distance: 400,
          //       duration: 0.4,
          //     },
          //     push: {
          //       particles_nb: 4,
          //     },
          //     remove: {
          //       particles_nb: 2,
          //     },
          //   },
          // },
          // retina_detect: true,
        }}
      />
    </div>
  );
};
export default ParticleComponent;
