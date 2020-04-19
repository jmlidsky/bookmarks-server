function makeBookmarksArray() {
    return [
        {
            id: 1,
            title: 'Thinkful',
            url: 'https://www.thinkful.com',
            description: 'Think outside the classroom',
            rating: 5,
        },
        {
            id: 2,
            title: 'Wikipedia',
            url: 'https://www.wikipedia.org',
            description: 'Free online encyclopedia',
            rating: 4,
        },
        {
            id: 3,
            title: 'MDN',
            url: 'https://developer.mozilla.org',
            description: 'The only place to find web documentation',
            rating: 5,
        },
    ];
}

module.exports = { makeBookmarksArray, }