"use client"
import { useRef, useState, useEffect } from 'react';
import { Grid, Button, Card, CardContent, Typography } from '@mui/material';
// import LargeCard from './LargeCard'; // Assuming LargeCard is in a separate file
// import SmallCard from './SmallCard'; // Assuming SmallCard is in a separate file

const Carousel = () => {
    const [count, setCount] = useState(0);
    const cardContainerRef = useRef<HTMLDivElement>(null); // Correct type for useRef
    const cardWidth = 300; // Width of each card (adjust as per your design)
    const visibleCards = 3; // Number of visible cards at a time
    const cardMargin = 16; // Margin between cards

    const cards = [
        { id: 1, title: 'Card 1', content: 'Content for Card 1' },
        { id: 2, title: 'Card 2', content: 'Content for Card 2' },
        { id: 3, title: 'Card 3', content: 'Content for Card 3' },
        { id: 4, title: 'Card 4', content: 'Content for Card 4' },
        { id: 5, title: 'Card 5', content: 'Content for Card 5' },
        { id: 6, title: 'Card 6', content: 'Content for Card 6' },
    ];

    const handleNext = () => {
        setCount((prevIndex) => (prevIndex === cards.length - 1 ? 0 : prevIndex + 1));
    };

    const handlePrev = () => {
        setCount((prevIndex) => (prevIndex === 0 ? cards.length - 1 : prevIndex - 1));
    };

    const centerSelectedCard = (index: number) => {
        if (cardContainerRef.current) {
            const containerWidth = cardContainerRef.current.offsetWidth;
            const scrollLeft = index * (cardWidth + cardMargin) - (containerWidth - cardWidth) / 2;
            cardContainerRef.current.scrollTo({ left: scrollLeft, behavior: 'smooth' });
        }
    };

    useEffect(() => {
        centerSelectedCard(count);
    }, [count]);

    return (
        <div className="ml:0 lg:ml-[17.35vw]" style={{ backgroundColor: "#F6F5FB", paddingBottom: '5vh', minHeight: '100vh', }}>
            <Grid container spacing={2} justifyContent="center" sx={{ backgroundColor: 'blue', mt: 2 }}>
                <Grid item xs={12} sm={8} md={10} sx={{ width: '70vw', backgroundColor: 'orange', py: 5 }}>
                    <div
                        ref={cardContainerRef}
                        style={{ overflowX: 'hidden', display: 'flex', alignItems: 'flex-end', transition: 'scroll 0.5s ease-in-out' }}
                    >
                        {cards.map((card, index) => {
                            let position = index - count;
                            if (position < 0) position += cards.length;

                            const isSelected = index === count;

                            return (
                                <div
                                    key={card.id}
                                    style={{
                                        flex: `0 0 ${cardWidth}px`,
                                        marginRight: cardMargin,
                                        transition: 'transform 0.5s ease-in-out',
                                        transform: isSelected ? 'scale(1)' : 'scale(0.9)',
                                    }}
                                >
                                    {isSelected ? (
                                        <LargeCard title={card.title} content={card.content} />
                                    ) : (
                                        <SmallCard title={card.title} content={card.content} />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </Grid>
                <Grid item xs={12} sx={{ textAlign: 'center' }}>
                    <Button onClick={handlePrev}>Prev</Button>
                    <Button onClick={handleNext}>Next</Button>
                </Grid>
            </Grid>
        </div>
    );
};

export default Carousel;




const SmallCard = ({ title, content }: any) => (
    <Card elevation={1} style={{ width: 300, height: 250 }}>
        <CardContent>
            <Typography variant="h5" component="div">
                {title}
            </Typography>
            <Typography variant="body2">{content}</Typography>
        </CardContent>
    </Card>
);

const LargeCard = ({ title, content }: any) => (
    <Card elevation={8} style={{ border: '2px solid red', borderRadius: 8, width: 420, height: 300 }}>
        <CardContent>
            <Typography variant="h5" component="div">
                {title}
            </Typography>
            <Typography variant="body2">{content}</Typography>
        </CardContent>
    </Card>
);
