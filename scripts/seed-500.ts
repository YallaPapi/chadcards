/**
 * seed-500.ts — Bulk card generation for 500 celebrities/public figures.
 *
 * Usage:
 *   npm run seed:500                  # run from the beginning
 *   npm run seed:500 -- --start 100   # resume from index 100
 *
 * Prerequisites:
 *   - Dev server running on localhost:3000  (npm run dev)
 */

// ────────────────────────────────────────────────────────────────────────────
// Parse CLI flags
// ────────────────────────────────────────────────────────────────────────────
const startFlag = process.argv.find((a) => a.startsWith('--start'))
const startArgIdx = process.argv.indexOf('--start')
const START_INDEX =
  startFlag && startFlag.includes('=')
    ? parseInt(startFlag.split('=')[1], 10)
    : startArgIdx !== -1 && process.argv[startArgIdx + 1]
      ? parseInt(process.argv[startArgIdx + 1], 10)
      : 0

const DELAY_MS = 3_000
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'

// ────────────────────────────────────────────────────────────────────────────
// The list — 500 public figures
// ────────────────────────────────────────────────────────────────────────────
const CELEBRITIES: { name: string; category: string }[] = [
  // =======================================================================
  // POLITICIANS (80)
  // =======================================================================

  // US Presidents — living
  { name: 'Donald Trump', category: 'politician' },
  { name: 'Joe Biden', category: 'politician' },
  { name: 'Barack Obama', category: 'politician' },
  { name: 'George W. Bush', category: 'politician' },
  { name: 'Bill Clinton', category: 'politician' },
  { name: 'Jimmy Carter', category: 'politician' },

  // US Presidents — notable deceased
  { name: 'John F. Kennedy', category: 'politician' },
  { name: 'Richard Nixon', category: 'politician' },
  { name: 'Ronald Reagan', category: 'politician' },
  { name: 'Abraham Lincoln', category: 'politician' },
  { name: 'Franklin D. Roosevelt', category: 'politician' },
  { name: 'Theodore Roosevelt', category: 'politician' },
  { name: 'George Washington', category: 'politician' },
  { name: 'Thomas Jefferson', category: 'politician' },
  { name: 'Andrew Jackson', category: 'politician' },
  { name: 'Dwight D. Eisenhower', category: 'politician' },
  { name: 'Harry S. Truman', category: 'politician' },
  { name: 'Lyndon B. Johnson', category: 'politician' },

  // Current world leaders
  { name: 'Vladimir Putin', category: 'politician' },
  { name: 'Xi Jinping', category: 'politician' },
  { name: 'Volodymyr Zelenskyy', category: 'politician' },
  { name: 'Narendra Modi', category: 'politician' },
  { name: 'Mohammed bin Salman', category: 'politician' },
  { name: 'Kim Jong Un', category: 'politician' },
  { name: 'Justin Trudeau', category: 'politician' },
  { name: 'Emmanuel Macron', category: 'politician' },
  { name: 'Javier Milei', category: 'politician' },
  { name: 'Recep Tayyip Erdogan', category: 'politician' },
  { name: 'Olaf Scholz', category: 'politician' },
  { name: 'Giorgia Meloni', category: 'politician' },
  { name: 'Keir Starmer', category: 'politician' },
  { name: 'Benjamin Netanyahu', category: 'politician' },
  { name: 'Luiz Inacio Lula da Silva', category: 'politician' },
  { name: 'Nayib Bukele', category: 'politician' },

  // US politicians — current/recent
  { name: 'Kamala Harris', category: 'politician' },
  { name: 'Mike Pence', category: 'politician' },
  { name: 'J. D. Vance', category: 'politician' },
  { name: 'Alexandria Ocasio-Cortez', category: 'politician' },
  { name: 'Marjorie Taylor Greene', category: 'politician' },
  { name: 'Nancy Pelosi', category: 'politician' },
  { name: 'Bernie Sanders', category: 'politician' },
  { name: 'Mitch McConnell', category: 'politician' },
  { name: 'Vivek Ramaswamy', category: 'politician' },
  { name: 'Nikki Haley', category: 'politician' },
  { name: 'Robert F. Kennedy Jr.', category: 'politician' },
  { name: 'Ron DeSantis', category: 'politician' },
  { name: 'Ted Cruz', category: 'politician' },
  { name: 'Matt Gaetz', category: 'politician' },
  { name: 'Gavin Newsom', category: 'politician' },
  { name: 'Tim Walz', category: 'politician' },
  { name: 'Josh Hawley', category: 'politician' },
  { name: 'Tulsi Gabbard', category: 'politician' },
  { name: 'Mike Johnson', category: 'politician' },
  { name: 'Pete Buttigieg', category: 'politician' },
  { name: 'Ilhan Omar', category: 'politician' },
  { name: 'Rand Paul', category: 'politician' },
  { name: 'Marco Rubio', category: 'politician' },
  { name: 'Hillary Clinton', category: 'politician' },

  // Historical political figures
  { name: 'Winston Churchill', category: 'politician' },
  { name: 'Joseph Stalin', category: 'politician' },
  { name: 'Adolf Hitler', category: 'politician' },
  { name: 'Mao Zedong', category: 'politician' },
  { name: 'Margaret Thatcher', category: 'politician' },
  { name: 'Fidel Castro', category: 'politician' },
  { name: 'Nelson Mandela', category: 'politician' },
  { name: 'Benito Mussolini', category: 'politician' },
  { name: 'Che Guevara', category: 'politician' },
  { name: 'Vladimir Lenin', category: 'politician' },
  { name: 'Napoleon', category: 'politician' },
  { name: 'Saddam Hussein', category: 'politician' },
  { name: 'Muammar Gaddafi', category: 'politician' },
  { name: 'Queen Elizabeth II', category: 'politician' },
  { name: 'Pope Francis', category: 'politician' },

  // =======================================================================
  // TECH (60)
  // =======================================================================

  // Big tech founders/CEOs
  { name: 'Elon Musk', category: 'tech' },
  { name: 'Mark Zuckerberg', category: 'tech' },
  { name: 'Jeff Bezos', category: 'tech' },
  { name: 'Sam Altman', category: 'tech' },
  { name: 'Sundar Pichai', category: 'tech' },
  { name: 'Satya Nadella', category: 'tech' },
  { name: 'Tim Cook', category: 'tech' },
  { name: 'Jensen Huang', category: 'tech' },
  { name: 'Jack Dorsey', category: 'tech' },
  { name: 'Palmer Luckey', category: 'tech' },
  { name: 'Peter Thiel', category: 'tech' },
  { name: 'Marc Andreessen', category: 'tech' },
  { name: 'Larry Page', category: 'tech' },
  { name: 'Sergey Brin', category: 'tech' },
  { name: 'Bill Gates', category: 'tech' },
  { name: 'Steve Jobs', category: 'tech' },
  { name: 'Steve Wozniak', category: 'tech' },
  { name: 'Larry Ellison', category: 'tech' },
  { name: 'Michael Dell', category: 'tech' },
  { name: 'Lisa Su', category: 'tech' },
  { name: 'Pat Gelsinger', category: 'tech' },
  { name: 'Susan Wojcicki', category: 'tech' },
  { name: 'Sheryl Sandberg', category: 'tech' },
  { name: 'Reed Hastings', category: 'tech' },
  { name: 'Travis Kalanick', category: 'tech' },
  { name: 'Daniel Ek', category: 'tech' },
  { name: 'Brian Chesky', category: 'tech' },
  { name: 'Drew Houston', category: 'tech' },
  { name: 'Stewart Butterfield', category: 'tech' },
  { name: 'Kevin Systrom', category: 'tech' },
  { name: 'Evan Spiegel', category: 'tech' },
  { name: 'Bobby Kotick', category: 'tech' },
  { name: 'Gabe Newell', category: 'tech' },
  { name: 'Linus Torvalds', category: 'tech' },
  { name: 'John Carmack', category: 'tech' },
  { name: 'Dario Amodei', category: 'tech' },
  { name: 'Demis Hassabis', category: 'tech' },
  { name: 'Yann LeCun', category: 'tech' },
  { name: 'Geoffrey Hinton', category: 'tech' },
  { name: 'Ilya Sutskever', category: 'tech' },
  { name: 'Andrej Karpathy', category: 'tech' },
  { name: 'Brian Acton', category: 'tech' },
  { name: 'Jan Koum', category: 'tech' },
  { name: 'Patrick Collison', category: 'tech' },
  { name: 'Tobias Lutke', category: 'tech' },
  { name: 'Masayoshi Son', category: 'tech' },
  { name: 'Lei Jun', category: 'tech' },
  { name: 'Jack Ma', category: 'tech' },
  { name: 'Pony Ma', category: 'tech' },

  // Crypto
  { name: 'Changpeng Zhao', category: 'tech' },
  { name: 'Sam Bankman-Fried', category: 'tech' },
  { name: 'Vitalik Buterin', category: 'tech' },
  { name: 'Brian Armstrong', category: 'tech' },
  { name: 'Do Kwon', category: 'tech' },
  { name: 'Charles Hoskinson', category: 'tech' },
  { name: 'Justin Sun', category: 'tech' },
  { name: 'Michael Saylor', category: 'tech' },
  { name: 'Satoshi Nakamoto', category: 'tech' },
  { name: 'Anatoly Yakovenko', category: 'tech' },
  { name: 'Gavin Wood', category: 'tech' },

  // =======================================================================
  // ENTERTAINERS (100)
  // =======================================================================

  // Musicians
  { name: 'Drake (musician)', category: 'entertainer' },
  { name: 'Kanye West', category: 'entertainer' },
  { name: 'Taylor Swift', category: 'entertainer' },
  { name: 'Beyonce', category: 'entertainer' },
  { name: 'Rihanna', category: 'entertainer' },
  { name: 'Travis Scott', category: 'entertainer' },
  { name: 'Bad Bunny', category: 'entertainer' },
  { name: 'Eminem', category: 'entertainer' },
  { name: 'Jay-Z', category: 'entertainer' },
  { name: 'Kendrick Lamar', category: 'entertainer' },
  { name: 'Post Malone', category: 'entertainer' },
  { name: 'Billie Eilish', category: 'entertainer' },
  { name: 'The Weeknd', category: 'entertainer' },
  { name: 'Ariana Grande', category: 'entertainer' },
  { name: 'Lady Gaga', category: 'entertainer' },
  { name: 'Ed Sheeran', category: 'entertainer' },
  { name: 'Bruno Mars', category: 'entertainer' },
  { name: 'Dua Lipa', category: 'entertainer' },
  { name: 'SZA', category: 'entertainer' },
  { name: 'Doja Cat', category: 'entertainer' },
  { name: 'Nicki Minaj', category: 'entertainer' },
  { name: 'Cardi B', category: 'entertainer' },
  { name: 'Lil Nas X', category: 'entertainer' },
  { name: 'Tyler, the Creator', category: 'entertainer' },
  { name: 'Lil Wayne', category: 'entertainer' },
  { name: '50 Cent', category: 'entertainer' },
  { name: 'Snoop Dogg', category: 'entertainer' },
  { name: 'Ice Cube', category: 'entertainer' },
  { name: 'Shakira', category: 'entertainer' },
  { name: 'Adele', category: 'entertainer' },
  { name: 'Justin Bieber', category: 'entertainer' },
  { name: 'Harry Styles', category: 'entertainer' },
  { name: 'Olivia Rodrigo', category: 'entertainer' },
  { name: 'Miley Cyrus', category: 'entertainer' },
  { name: 'Selena Gomez', category: 'entertainer' },
  { name: 'Demi Lovato', category: 'entertainer' },
  { name: 'Sam Smith', category: 'entertainer' },
  { name: 'Megan Thee Stallion', category: 'entertainer' },
  { name: '21 Savage', category: 'entertainer' },
  { name: 'J. Cole', category: 'entertainer' },
  { name: 'Future (rapper)', category: 'entertainer' },
  { name: 'Metro Boomin', category: 'entertainer' },
  { name: 'Peso Pluma', category: 'entertainer' },
  { name: 'Morgan Wallen', category: 'entertainer' },

  // Actors
  { name: 'Leonardo DiCaprio', category: 'entertainer' },
  { name: 'Tom Cruise', category: 'entertainer' },
  { name: 'Dwayne Johnson', category: 'entertainer' },
  { name: 'Will Smith', category: 'entertainer' },
  { name: 'Robert Downey Jr.', category: 'entertainer' },
  { name: 'Keanu Reeves', category: 'entertainer' },
  { name: 'Margot Robbie', category: 'entertainer' },
  { name: 'Zendaya', category: 'entertainer' },
  { name: 'Timothee Chalamet', category: 'entertainer' },
  { name: 'Tom Holland', category: 'entertainer' },
  { name: 'Chris Hemsworth', category: 'entertainer' },
  { name: 'Scarlett Johansson', category: 'entertainer' },
  { name: 'Ryan Reynolds', category: 'entertainer' },
  { name: 'Denzel Washington', category: 'entertainer' },
  { name: 'Morgan Freeman', category: 'entertainer' },
  { name: 'Samuel L. Jackson', category: 'entertainer' },
  { name: 'Brad Pitt', category: 'entertainer' },
  { name: 'Johnny Depp', category: 'entertainer' },
  { name: 'Angelina Jolie', category: 'entertainer' },
  { name: 'Jennifer Lawrence', category: 'entertainer' },
  { name: 'Chris Pratt', category: 'entertainer' },
  { name: 'Cillian Murphy', category: 'entertainer' },
  { name: 'Pedro Pascal', category: 'entertainer' },
  { name: 'Sydney Sweeney', category: 'entertainer' },
  { name: 'Florence Pugh', category: 'entertainer' },
  { name: 'Anya Taylor-Joy', category: 'entertainer' },
  { name: 'Nicolas Cage', category: 'entertainer' },
  { name: 'Adam Sandler', category: 'entertainer' },
  { name: 'Arnold Schwarzenegger', category: 'entertainer' },
  { name: 'Al Pacino', category: 'entertainer' },
  { name: 'Robert De Niro', category: 'entertainer' },
  { name: 'Jack Nicholson', category: 'entertainer' },

  // Comedians
  { name: 'Dave Chappelle', category: 'entertainer' },
  { name: 'Kevin Hart', category: 'entertainer' },
  { name: 'Bill Burr', category: 'entertainer' },
  { name: 'Chris Rock', category: 'entertainer' },
  { name: 'Jerry Seinfeld', category: 'entertainer' },
  { name: 'Jim Carrey', category: 'entertainer' },
  { name: 'Ricky Gervais', category: 'entertainer' },
  { name: 'Matt Rife', category: 'entertainer' },
  { name: 'Theo Von', category: 'entertainer' },
  { name: 'Shane Gillis', category: 'entertainer' },
  { name: 'Mark Normand', category: 'entertainer' },

  // Directors / Showrunners
  { name: 'Steven Spielberg', category: 'entertainer' },
  { name: 'Christopher Nolan', category: 'entertainer' },
  { name: 'Quentin Tarantino', category: 'entertainer' },
  { name: 'Martin Scorsese', category: 'entertainer' },
  { name: 'Denis Villeneuve', category: 'entertainer' },
  { name: 'James Cameron', category: 'entertainer' },
  { name: 'Ridley Scott', category: 'entertainer' },
  { name: 'Jordan Peele', category: 'entertainer' },
  { name: 'Greta Gerwig', category: 'entertainer' },

  // =======================================================================
  // ATHLETES (60)
  // =======================================================================

  // Football / Soccer
  { name: 'Lionel Messi', category: 'athlete' },
  { name: 'Cristiano Ronaldo', category: 'athlete' },
  { name: 'Kylian Mbappe', category: 'athlete' },
  { name: 'Erling Haaland', category: 'athlete' },
  { name: 'Neymar', category: 'athlete' },
  { name: 'Vinicius Junior', category: 'athlete' },
  { name: 'Jude Bellingham', category: 'athlete' },
  { name: 'Lamine Yamal', category: 'athlete' },
  { name: 'Zinedine Zidane', category: 'athlete' },
  { name: 'Ronaldinho', category: 'athlete' },
  { name: 'David Beckham', category: 'athlete' },
  { name: 'Pele', category: 'athlete' },
  { name: 'Diego Maradona', category: 'athlete' },

  // Basketball
  { name: 'LeBron James', category: 'athlete' },
  { name: 'Stephen Curry', category: 'athlete' },
  { name: 'Michael Jordan', category: 'athlete' },
  { name: 'Shaquille O\'Neal', category: 'athlete' },
  { name: 'Kobe Bryant', category: 'athlete' },
  { name: 'Kevin Durant', category: 'athlete' },
  { name: 'Giannis Antetokounmpo', category: 'athlete' },
  { name: 'Luka Doncic', category: 'athlete' },
  { name: 'Nikola Jokic', category: 'athlete' },
  { name: 'Wilt Chamberlain', category: 'athlete' },

  // MMA / Boxing
  { name: 'Conor McGregor', category: 'athlete' },
  { name: 'Jon Jones', category: 'athlete' },
  { name: 'Khabib Nurmagomedov', category: 'athlete' },
  { name: 'Israel Adesanya', category: 'athlete' },
  { name: 'Amanda Nunes', category: 'athlete' },
  { name: 'Mike Tyson', category: 'athlete' },
  { name: 'Floyd Mayweather Jr.', category: 'athlete' },
  { name: 'Tyson Fury', category: 'athlete' },
  { name: 'Manny Pacquiao', category: 'athlete' },
  { name: 'Jake Paul', category: 'athlete' },
  { name: 'Logan Paul', category: 'athlete' },
  { name: 'Canelo Alvarez', category: 'athlete' },

  // American Football
  { name: 'Tom Brady', category: 'athlete' },
  { name: 'Patrick Mahomes', category: 'athlete' },
  { name: 'Travis Kelce', category: 'athlete' },
  { name: 'Lamar Jackson', category: 'athlete' },
  { name: 'Jalen Hurts', category: 'athlete' },

  // Tennis
  { name: 'Novak Djokovic', category: 'athlete' },
  { name: 'Roger Federer', category: 'athlete' },
  { name: 'Rafael Nadal', category: 'athlete' },
  { name: 'Serena Williams', category: 'athlete' },
  { name: 'Carlos Alcaraz', category: 'athlete' },
  { name: 'Naomi Osaka', category: 'athlete' },

  // Other Sports
  { name: 'Usain Bolt', category: 'athlete' },
  { name: 'Michael Phelps', category: 'athlete' },
  { name: 'Tiger Woods', category: 'athlete' },
  { name: 'Lewis Hamilton', category: 'athlete' },
  { name: 'Max Verstappen', category: 'athlete' },
  { name: 'Simone Biles', category: 'athlete' },
  { name: 'Wayne Gretzky', category: 'athlete' },
  { name: 'Shohei Ohtani', category: 'athlete' },
  { name: 'Shaun White', category: 'athlete' },
  { name: 'Alex Ovechkin', category: 'athlete' },
  { name: 'Magnus Carlsen', category: 'athlete' },
  { name: 'Babe Ruth', category: 'athlete' },

  // =======================================================================
  // INTERNET / INFLUENCERS (60)
  // =======================================================================

  // YouTubers
  { name: 'MrBeast', category: 'internet' },
  { name: 'PewDiePie', category: 'internet' },
  { name: 'KSI', category: 'internet' },
  { name: 'Markiplier', category: 'internet' },
  { name: 'Jacksepticeye', category: 'internet' },
  { name: 'Marques Brownlee', category: 'internet' },
  { name: 'Linus Sebastian', category: 'internet' },
  { name: 'Casey Neistat', category: 'internet' },
  { name: 'Emma Chamberlain', category: 'internet' },
  { name: 'David Dobrik', category: 'internet' },
  { name: 'Danny Gonzalez', category: 'internet' },
  { name: 'Drew Gooden', category: 'internet' },
  { name: 'iShowSpeed', category: 'internet' },
  { name: 'penguinz0', category: 'internet' },
  { name: 'Kai Cenat', category: 'internet' },
  { name: 'Ryan Trahan', category: 'internet' },
  { name: 'JiDion', category: 'internet' },
  { name: 'Airrack', category: 'internet' },
  { name: 'Adin Ross', category: 'internet' },
  { name: 'SSSniperWolf', category: 'internet' },

  // Streamers
  { name: 'xQc', category: 'internet' },
  { name: 'Ninja (streamer)', category: 'internet' },
  { name: 'Pokimane', category: 'internet' },
  { name: 'Amouranth', category: 'internet' },
  { name: 'Asmongold', category: 'internet' },
  { name: 'HasanAbi', category: 'internet' },
  { name: 'Ludwig Ahgren', category: 'internet' },
  { name: 'Shroud', category: 'internet' },
  { name: 'Dr Disrespect', category: 'internet' },
  { name: 'Tyler1', category: 'internet' },

  // Podcasters / Media
  { name: 'Joe Rogan', category: 'internet' },
  { name: 'Lex Fridman', category: 'internet' },
  { name: 'Tucker Carlson', category: 'internet' },
  { name: 'Ben Shapiro', category: 'internet' },
  { name: 'Jordan Peterson', category: 'internet' },
  { name: 'Steven Crowder', category: 'internet' },
  { name: 'Patrick Bet-David', category: 'internet' },
  { name: 'Destiny (streamer)', category: 'internet' },
  { name: 'Charlie Kirk', category: 'internet' },
  { name: 'Candace Owens', category: 'internet' },
  { name: 'Tim Pool', category: 'internet' },
  { name: 'H3h3Productions', category: 'internet' },

  // Social media influencers
  { name: 'Andrew Tate', category: 'internet' },
  { name: 'Kim Kardashian', category: 'internet' },
  { name: 'Kylie Jenner', category: 'internet' },
  { name: 'Addison Rae', category: 'internet' },
  { name: "Charli D'Amelio", category: 'internet' },
  { name: 'Khaby Lame', category: 'internet' },
  { name: 'Bella Poarch', category: 'internet' },
  // Internet famous / gaming
  { name: 'Notch', category: 'internet' },
  { name: 'Hideo Kojima', category: 'internet' },
  { name: 'Dream (YouTuber)', category: 'internet' },
  { name: 'Technoblade', category: 'internet' },

  // =======================================================================
  // BUSINESS / BILLIONAIRES (60)
  // =======================================================================

  { name: 'Warren Buffett', category: 'business' },
  { name: 'Oprah Winfrey', category: 'business' },
  { name: 'Richard Branson', category: 'business' },
  { name: 'Michael Bloomberg', category: 'business' },
  { name: 'George Soros', category: 'business' },
  { name: 'Charles Koch', category: 'business' },
  { name: 'David Koch', category: 'business' },
  { name: 'Rupert Murdoch', category: 'business' },
  { name: 'Bob Iger', category: 'business' },
  { name: 'Jamie Dimon', category: 'business' },
  { name: 'Ray Dalio', category: 'business' },
  { name: 'Carl Icahn', category: 'business' },
  { name: 'Mark Cuban', category: 'business' },
  { name: 'Bernard Arnault', category: 'business' },
  { name: 'Mukesh Ambani', category: 'business' },
  { name: 'Gautam Adani', category: 'business' },
  { name: 'Carlos Slim', category: 'business' },
  { name: 'Francoise Bettencourt Meyers', category: 'business' },
  { name: 'Amancio Ortega', category: 'business' },
  { name: 'Ken Griffin', category: 'business' },
  { name: 'Steve Cohen', category: 'business' },
  { name: 'Cathie Wood', category: 'business' },
  { name: 'Sam Walton', category: 'business' },
  { name: 'John D. Rockefeller', category: 'business' },
  { name: 'Andrew Carnegie', category: 'business' },
  { name: 'Henry Ford', category: 'business' },
  { name: 'J. P. Morgan', category: 'business' },
  { name: 'Cornelius Vanderbilt', category: 'business' },
  { name: 'Walt Disney', category: 'business' },
  { name: 'Howard Hughes', category: 'business' },
  { name: 'Martha Stewart', category: 'business' },
  { name: 'Sara Blakely', category: 'business' },
  { name: 'Phil Knight', category: 'business' },
  { name: 'Howard Schultz', category: 'business' },
  { name: 'Sheldon Adelson', category: 'business' },
  { name: 'Leon Black', category: 'business' },
  { name: 'Stephen Schwarzman', category: 'business' },
  { name: 'David Geffen', category: 'business' },
  { name: 'Diane von Furstenberg', category: 'business' },
  { name: 'Dana White', category: 'business' },
  { name: 'Vince McMahon', category: 'business' },
  { name: 'Roger Goodell', category: 'business' },
  { name: 'Adam Silver', category: 'business' },
  { name: 'Anna Wintour', category: 'business' },
  { name: 'Tyler Perry', category: 'business' },
  { name: 'Kevin O\'Leary', category: 'business' },
  { name: 'Barbara Corcoran', category: 'business' },
  { name: 'Daymond John', category: 'business' },
  { name: 'Arianna Huffington', category: 'business' },
  { name: 'Gary Vaynerchuk', category: 'business' },
  { name: 'Grant Cardone', category: 'business' },
  { name: 'Naval Ravikant', category: 'business' },
  { name: 'Chamath Palihapitiya', category: 'business' },
  { name: 'Keith Rabois', category: 'business' },
  { name: 'Balaji Srinivasan', category: 'business' },
  { name: 'David Sachs', category: 'business' },

  // =======================================================================
  // HISTORICAL / CULTURAL (40)
  // =======================================================================

  { name: 'Albert Einstein', category: 'historical' },
  { name: 'Nikola Tesla', category: 'historical' },
  { name: 'Martin Luther King Jr.', category: 'historical' },
  { name: 'Mahatma Gandhi', category: 'historical' },
  { name: 'Muhammad Ali', category: 'historical' },
  { name: 'Marilyn Monroe', category: 'historical' },
  { name: 'Elvis Presley', category: 'historical' },
  { name: 'Princess Diana', category: 'historical' },
  { name: 'Steve Irwin', category: 'historical' },
  { name: 'Bob Ross', category: 'historical' },
  { name: 'Fred Rogers', category: 'historical' },
  { name: 'Anthony Bourdain', category: 'historical' },
  { name: 'Bruce Lee', category: 'historical' },
  { name: 'Cleopatra', category: 'historical' },
  { name: 'Genghis Khan', category: 'historical' },
  { name: 'Julius Caesar', category: 'historical' },
  { name: 'Leonardo da Vinci', category: 'historical' },
  { name: 'Galileo Galilei', category: 'historical' },
  { name: 'Isaac Newton', category: 'historical' },
  { name: 'Charles Darwin', category: 'historical' },
  { name: 'Marie Curie', category: 'historical' },
  { name: 'Stephen Hawking', category: 'historical' },
  { name: 'Alan Turing', category: 'historical' },
  { name: 'Sigmund Freud', category: 'historical' },
  { name: 'William Shakespeare', category: 'historical' },
  { name: 'Mark Twain', category: 'historical' },
  { name: 'Frida Kahlo', category: 'historical' },
  { name: 'Pablo Picasso', category: 'historical' },
  { name: 'Vincent van Gogh', category: 'historical' },
  { name: 'Salvador Dali', category: 'historical' },
  { name: 'Amelia Earhart', category: 'historical' },
  { name: 'Rosa Parks', category: 'historical' },
  { name: 'Harriet Tubman', category: 'historical' },
  { name: 'Sun Tzu', category: 'historical' },
  { name: 'Confucius', category: 'historical' },
  { name: 'Socrates', category: 'historical' },
  { name: 'Alexander the Great', category: 'historical' },
  { name: 'Mother Teresa', category: 'historical' },
  { name: 'Anne Frank', category: 'historical' },
  { name: 'Dalai Lama', category: 'historical' },

  // =======================================================================
  // CONTROVERSIAL / VILLAINS (40)
  // =======================================================================

  { name: 'Elizabeth Holmes', category: 'villain' },
  { name: 'Martin Shkreli', category: 'villain' },
  { name: 'Harvey Weinstein', category: 'villain' },
  { name: 'Bernie Madoff', category: 'villain' },
  { name: 'Jeffrey Epstein', category: 'villain' },
  { name: 'Alex Jones', category: 'villain' },
  { name: 'R. Kelly', category: 'villain' },
  { name: 'Bill Cosby', category: 'villain' },
  { name: 'Ghislaine Maxwell', category: 'villain' },
  { name: 'Diddy', category: 'villain' },
  { name: 'Billy McFarland', category: 'villain' },
  { name: 'Adam Neumann', category: 'villain' },
  { name: 'Dan Bilzerian', category: 'villain' },
  { name: 'Amber Heard', category: 'villain' },
  { name: 'Jussie Smollett', category: 'villain' },
  { name: 'Lance Armstrong', category: 'villain' },
  { name: 'O. J. Simpson', category: 'villain' },
  { name: 'Joe Exotic', category: 'villain' },
  { name: 'Charles Manson', category: 'villain' },
  { name: 'Ted Kaczynski', category: 'villain' },
  { name: 'Al Capone', category: 'villain' },
  { name: 'Pablo Escobar', category: 'villain' },
  { name: 'El Chapo', category: 'villain' },
  { name: 'Osama bin Laden', category: 'villain' },
  { name: 'Idi Amin', category: 'villain' },
  { name: 'Pol Pot', category: 'villain' },
  { name: 'Vlad the Impaler', category: 'villain' },
  { name: 'Rasputin', category: 'villain' },
  { name: 'Nero', category: 'villain' },
  { name: 'Attila the Hun', category: 'villain' },
  { name: 'Caligula', category: 'villain' },
  { name: 'Ivan the Terrible', category: 'villain' },
  { name: 'Kenneth Lay', category: 'villain' },
  { name: 'Jordan Belfort', category: 'villain' },
  { name: 'Rudy Giuliani', category: 'villain' },
  { name: 'Steve Bannon', category: 'villain' },
  { name: 'Roger Stone', category: 'villain' },
  { name: 'George Santos', category: 'villain' },
  { name: 'Tiffany Henyard', category: 'villain' },
  { name: 'Anna Delvey', category: 'villain' },

  // =======================================================================
  // ADDITIONAL — fill to 500
  // =======================================================================

  // More politicians
  { name: 'Shinzo Abe', category: 'politician' },
  { name: 'Angela Merkel', category: 'politician' },
  { name: 'Tony Blair', category: 'politician' },
  { name: 'Elizabeth Warren', category: 'politician' },

  // More athletes
  { name: 'Sachin Tendulkar', category: 'athlete' },
  { name: 'Virat Kohli', category: 'athlete' },
  { name: 'Dustin Poirier', category: 'athlete' },
  { name: 'Alex Pereira', category: 'athlete' },
  { name: 'Ilia Topuria', category: 'athlete' },

  // More entertainers
  { name: 'Ice Spice', category: 'entertainer' },
  { name: 'Sabrina Carpenter', category: 'entertainer' },
  { name: 'Chappell Roan', category: 'entertainer' },
  { name: 'Jenna Ortega', category: 'entertainer' },
  { name: 'Ana de Armas', category: 'entertainer' },
  { name: 'Glen Powell', category: 'entertainer' },
  { name: 'Austin Butler', category: 'entertainer' },

  // More business
  { name: 'Larry Fink', category: 'business' },

  // More internet
  { name: 'Valkyrae', category: 'internet' },
  { name: 'Corpse Husband', category: 'internet' },
  { name: 'TommyInnit', category: 'internet' },

  // More historical
  { name: 'Aristotle', category: 'historical' },
  { name: 'Marco Polo', category: 'historical' },
  { name: 'Neil Armstrong', category: 'historical' },
  { name: 'Buzz Aldrin', category: 'historical' },
]

// ────────────────────────────────────────────────────────────────────────────
// Runner
// ────────────────────────────────────────────────────────────────────────────

async function main() {
  const total = CELEBRITIES.length
  let generated = 0
  let failed = 0
  let skipped = 0

  console.log(`\n=== SEED-500: Generating ${total} celebrity cards ===`)
  console.log(`API: ${BASE_URL}/api/generate`)
  console.log(`Delay: ${DELAY_MS}ms between calls`)
  if (START_INDEX > 0) {
    console.log(`Resuming from index: ${START_INDEX}`)
  }
  console.log('')

  for (let i = START_INDEX; i < total; i++) {
    const { name, category } = CELEBRITIES[i]
    console.log(`[${i + 1}/${total}] Generating: ${name} (${category})...`)

    try {
      const res = await fetch(`${BASE_URL}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }))

        // Check for "already exists" style responses
        if (res.status === 409 || (err.error && /already exists/i.test(err.error))) {
          console.log(`  SKIP: ${name} (already exists)`)
          skipped++
        } else {
          throw new Error(err.error || `HTTP ${res.status}`)
        }
      } else {
        const card = await res.json()

        // The API may return the card even if it already existed
        if (card.existed) {
          console.log(`  SKIP: ${name} (already exists)`)
          skipped++
        } else {
          console.log(`  OK: ${card.name} — ${card.typeLine} (${card.rarity})`)
          generated++
        }
      }
    } catch (error: any) {
      console.error(`  FAILED: ${name} — ${error.message}`)
      failed++
    }

    // Delay between calls (skip delay on last item)
    if (i < total - 1) {
      await new Promise((r) => setTimeout(r, DELAY_MS))
    }
  }

  // ── Summary ──────────────────────────────────────────────────────────────
  console.log('\n========================================')
  console.log('  SEED-500 COMPLETE')
  console.log('========================================')
  console.log(`  Total in list:  ${total}`)
  console.log(`  Generated:      ${generated}`)
  console.log(`  Skipped:        ${skipped}`)
  console.log(`  Failed:         ${failed}`)
  console.log('========================================\n')
}

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
