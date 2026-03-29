(() => {
  const BINGO_RANK_ORDER = Object.freeze(['D', 'C', 'B', 'A', 'S']);

  const BINGO_RANK_META = Object.freeze({
    D: { label: 'Rango D', className: 'rank-d', minLevel: 1, prob: '10%', goldBase: 200, stat: { hp: [180, 240], atk: [35, 55], def: [20, 35], xp: [4, 8] } },
    C: { label: 'Rango C', className: 'rank-c', minLevel: 12, prob: '20%', goldBase: 420, stat: { hp: [260, 350], atk: [65, 95], def: [35, 55], xp: [8, 14] } },
    B: { label: 'Rango B', className: 'rank-b', minLevel: 28, prob: '30%', goldBase: 760, stat: { hp: [360, 460], atk: [95, 130], def: [50, 75], xp: [14, 22] } },
    A: { label: 'Rango A', className: 'rank-a', minLevel: 55, prob: '40%', goldBase: 1240, stat: { hp: [520, 680], atk: [140, 190], def: [75, 110], xp: [22, 34] } },
    S: { label: 'Rango S', className: 'rank-s', minLevel: 75, prob: '50%', goldBase: 2050, stat: { hp: [720, 940], atk: [210, 280], def: [110, 160], xp: [36, 54] } }
  });

  const BINGO_ENEMIES_BY_RANK = Object.freeze({
    D: ['Naruto Uzumaki', 'Sakura Haruno', 'Shikamaru Nara', 'Hinata Hyūga', 'Rock Lee', 'Kiba Inuzuka', 'Shino Aburame', 'Choji Akimichi', 'Ino Yamanaka', 'Tenten', 'Temari', 'Kankurō'],
    C: ['Sai Yamanaka', 'Yamato', 'Rin Nohara', 'Shizune', 'Ibiki Morino', 'Zabuza Momochi', 'Haku', 'Suigetsu Hōzuki', 'Darui', 'Karui', 'Guren', 'Kimimaro'],
    B: ['Might Guy', 'Kakashi Hatake', 'Jiraiya', 'Tsunade', 'Orochimaru', 'Danzō Shimura', 'Killer Bee', 'Anko Mitarashi', 'Utakata', 'Karin Uzumaki', 'Jūgo', 'Chiyo'],
    A: ['Hashirama Senju', 'Tobirama Senju', 'Hiruzen Sarutobi', 'Minato Namikaze', 'Ōnoki', 'Madara Uchiha', 'Itachi Uchiha', 'Shisui Uchiha', 'Pain', 'Konan', 'Obito Uchiha', 'Hanzō'],
    S: ['Hagoromo Ōtsutsuki', 'Hamura Ōtsutsuki', 'Kaguya Ōtsutsuki', 'Isshiki Ōtsutsuki', 'Momoshiki Ōtsutsuki', 'Indra Ōtsutsuki', 'Ashura Ōtsutsuki', 'Kinshiki Ōtsutsuki', 'Toneri Ōtsutsuki', 'Urashiki Ōtsutsuki']
  });

  window.BINGO_RANK_ORDER = BINGO_RANK_ORDER;
  window.BINGO_RANK_META = BINGO_RANK_META;
  window.BINGO_ENEMIES_BY_RANK = BINGO_ENEMIES_BY_RANK;
})();
