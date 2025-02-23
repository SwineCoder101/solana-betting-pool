import { useState, useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Container, Row, Col, Button } from "react-bootstrap";
import headerStyles from "../sass/header.module.scss";
import GreenBananasList from "../components/landing-page/components/GreenBananasList";
import CTABanner from "../components/landing-page/components/CTABanner";
import InfoModal from "../components/landing-page/components/InfoModal";
import ChatBanana from "../components/landing-page/components/ChatBanana";
import LeaderboardTable from "../components/landing-page/components/LeaderboardTable";
import TvDisplay from "../components/landing-page/components/TvDisplay";
import { QueryClient, useQuery, useQueryClient } from '@tanstack/react-query'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'
import '../App.css'
import WordArt from "@/components/landing-page/components/WordArt";
import { usePrivy } from "@privy-io/react-auth";
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60 * 24, // 24 hours
    },
  },
})


const persister = typeof window !== "undefined"
  ? createSyncStoragePersister({ storage: window.localStorage })
  : null;



// let persister;

export default function Landing() {
  const {user, authenticated} = usePrivy();
  const [isClient, setIsClient] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const handleClose = () => setShowModal(false);
  const handleShow = () => setShowModal(true);

  const btnBananaRef = useRef(null);

  useGSAP(() => {
    gsap.to(btnBananaRef.current, {
      x: -5,
      rotation: 30,
      duration: 1,
      repeat: -1,
      yoyo: true,
      ease: "steps(6)"
    });
  });

  return (

    <div className="viewport-container">
    <PersistQueryClientProvider
    client={queryClient}
    persistOptions={{ persister } as any}
    >
    <Container className={`pageContainer `}>
      {!authenticated && (
        <header className={`${headerStyles.mainHeader}  `}>
          <Button variant="primary" className="btn-icon" style={{height: '75px'}} onClick={handleShow}>
            <img
              src="/landing-page/images/banana.svg"
              alt="Pixelated Banana"
              width={41}
              height={41}
              ref={btnBananaRef}
            />
            Click For More Info
          </Button>
          <h1>
            <img
              src="/landing-page/images/banana-logo.svg"
              alt="Banana Zone Logo"
              width={496}
              height={102}
            />
          <div className="text-3xl bold"> Tap, Bet, Boom <span style={{fontSize: "1.5em", paddingLeft: "10px"}}>🍌</span></div>
          </h1>
        </header>
      )}
      <main className={`${authenticated ? 'pt-4' : ''}`}>
        <Row>
          <Col xs={12} lg={8}>
            <h2 className="yellowStroke special uppercase bold">Top Bananas</h2>
            <LeaderboardTable/>
            <CTABanner isMobile={false} />
          </Col>
          <Col xs={12} lg={4}>
            <h2 className="greenStroke special">Green Bananas</h2>
            <GreenBananasList />
            <TvDisplay />
            <CTABanner isMobile={true} />
            <ChatBanana />
          </Col>
        </Row>
      </main>

      <InfoModal show={showModal} onClose={handleClose} />
    </Container>
    </PersistQueryClientProvider>
     <WordArt />
    </div>
  );
}



