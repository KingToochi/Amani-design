import image from '../images/hero-banner.jpg';


const HeroBanner = () => {
    return(
        <div
        className='absolute top-20 left-0 w-full h-[500px] bg-contain bg-center bg-no-repeat'
         style={{ backgroundImage: `url(${image})` }}
        >
        {/* Darker overlay for better text readability with vibrant African attire images */}
        <div className='absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center'>
            <div className='text-center text-white px-4 max-w-4xl mx-auto'>
                
                {/* Brand name */}
                <p className='text-amber-400 text-sm md:text-base uppercase tracking-widest mb-4 font-semibold'>
                    AmaniSky Fashion World
                </p>
                
                {/* Main headline - Choose one of the options below */}
                
                {/* Option 1: Heritage & Modern */}
                <h1 className='text-4xl md:text-6xl font-bold mb-6 leading-tight'>
                    Rooted in Tradition. <br className='hidden md:block' />
                    <span className='text-amber-400'>Built for the Future.</span>
                </h1>
                
                {/* Option 2: Executive/Menswear (uncomment to use instead)
                <h1 className='text-4xl md:text-6xl font-bold mb-6 leading-tight'>
                    Own Your <span className='text-amber-400'>Presence.</span>
                </h1>
                */}
                
                {/* Description */}
                <p className='text-lg md:text-2xl mb-8 text-gray-200 max-w-2xl mx-auto'>
                    Explore AmaniSky's exclusive collection of premium African attire. 
                    From bold prints to modern executive fits, define your narrative with confidence.
                </p>
                
                {/* Call to Action Buttons */}
                <div className='flex flex-col sm:flex-row gap-4 justify-center'>
                    <button className='bg-amber-600 hover:bg-amber-700 text-white font-bold py-4 px-8 rounded-lg text-lg transition duration-300 transform hover:scale-105 shadow-lg'>
                        Shop The Collection
                    </button>
                    
                    <button className='border-2 border-white hover:bg-white hover:text-gray-900 text-white font-bold py-4 px-8 rounded-lg text-lg transition duration-300'>
                        Explore Styles
                    </button>
                </div>
                
                {/* Optional: Small tagline */}
                <p className='text-xs md:text-sm text-gray-400 mt-8 tracking-wide'>
                    Premium African Attire | Global Delivery
                </p>
            </div>
        </div>
        </div>
    )
}

export default HeroBanner;