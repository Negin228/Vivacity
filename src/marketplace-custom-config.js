/*
 * Marketplace specific configuration.
 *
 * Every filter needs to have following keys:
 * - id:     Unique id of the filter.
 * - label:  The default label of the filter.
 * - type:   String that represents one of the existing filter components:
 *           BookingDateRangeFilter, KeywordFilter, PriceFilter,
 *           SelectSingleFilter, SelectMultipleFilter.
 * - group:  Is this 'primary' or 'secondary' filter?
 *           Primary filters are visible on desktop layout by default.
 *           Secondary filters are behind "More filters" button.
 *           Read more from src/containers/SearchPage/README.md
 * - queryParamNames: Describes parameters to be used with queries
 *                    (e.g. 'price' or 'pub_amenities'). Most of these are
 *                    the same between webapp URLs and API query params.
 *                    You can't change 'dates', 'price', or 'keywords'
 *                    since those filters are fixed to a specific attribute.
 * - config: Extra configuration that the filter component needs.
 *
 * Note 1: Labels could be tied to translation file
 *         by importing FormattedMessage:
 *         <FormattedMessage id="some.translation.key.here" />
 *
 * Note 2: If you need to add new custom filter components,
 *         you need to take those into use in:
 *         src/containers/SearchPage/FilterComponent.js
 *
 * Note 3: If you just want to create more enum filters
 *         (i.e. SelectSingleFilter, SelectMultipleFilter),
 *         you can just add more configurations with those filter types
 *         and tie them with correct extended data key
 *         (i.e. pub_<key> or meta_<key>).
 */

export const filters = [
  {
    id: 'dates-length',
    label: 'Dates',
    type: 'BookingDateRangeLengthFilter',
    group: 'primary',
    // Note: BookingDateRangeFilter is fixed filter,
    // you can't change "queryParamNames: ['dates'],"
    queryParamNames: ['dates', 'minDuration'],
    config: {
      // A global time zone to use in availability searches. As listings
      // can be in various time zones, we must decide what time zone we
      // use in search when looking for available listings within a
      // certain time interval.
      //
      // If you have all/most listings in a certain time zone, change this
      // config value to that.
      //
      // See: https://en.wikipedia.org/wiki/List_of_tz_database_time_zones
      searchTimeZone: 'Etc/UTC',

      // Options for the minimum duration of the booking
      options: [
        { key: '0', label: 'Any length' },
        { key: '60', label: '1 hour', shortLabel: '1h' },
        { key: '120', label: '2 hours', shortLabel: '2h' },
      ],
    },
  },
  {
    id: 'price',
    label: 'Price',
    type: 'PriceFilter',
    group: 'primary',
    // Note: PriceFilter is fixed filter,
    // you can't change "queryParamNames: ['price'],"
    queryParamNames: ['price'],
    // Price filter configuration
    // Note: unlike most prices this is not handled in subunits
    config: {
      min: 0,
      max: 1000,
      step: 5,
    },
  },
  {
    id: 'keyword',
    label: 'Keyword',
    type: 'KeywordFilter',
    group: 'primary',
    // Note: KeywordFilter is fixed filter,
    // you can't change "queryParamNames: ['keywords'],"
    queryParamNames: ['keywords'],
    // NOTE: If you are ordering search results by distance
    // the keyword search can't be used at the same time.
    // You can turn on/off ordering by distance from config.js file.
    config: {},
  },
  {
    id: 'yogaStyles',
    label: 'Yoga styles',
    type: 'SelectMultipleFilter',
    group: 'secondary',
    queryParamNames: ['pub_yogaStyles'],
    config: {
      // Optional modes: 'has_all', 'has_any'
      // https://www.sharetribe.com/api-reference/marketplace.html#extended-data-filtering
      searchMode: 'has_all',

      // "key" is the option you see in Flex Console.
      // "label" is set here for this web app's UI only.
      // Note: label is not added through the translation files
      // to make filter customizations a bit easier.
      options: [
        { key: 'ashtanga', label: 'Ashtanga' },
        { key: 'hatha', label: 'Hatha' },
        { key: 'kundalini', label: 'Kundalini' },
        { key: 'restorative', label: 'Restorative' },
        { key: 'vinyasa', label: 'Vinyasa' },
        { key: 'yin', label: 'Yin' },
      ],
    },
  },
  {
    id: 'certificate',
    label: 'Certificate',
    type: 'SelectSingleFilter',
    group: 'secondary',
    queryParamNames: ['pub_certificate'],
    config: {
      // "key" is the option you see in Flex Console.
      // "label" is set here for the UI only.
      // Note: label is not added through the translation files
      // to make filter customizations a bit easier.
      options: [
        { key: 'none', label: 'None', hideFromFilters: true, hideFromListingInfo: true },
        { key: '200h', label: 'Registered yoga teacher 200h' },
        { key: '500h', label: 'Registered yoga teacher 500h' },
      ],
    },
  },
];

export const sortConfig = {
  // Enable/disable the sorting control in the SearchPage
  active: true,

  // Note: queryParamName 'sort' is fixed,
  // you can't change it since Flex API expects it to be named as 'sort'
  queryParamName: 'sort',

  // Internal key for the relevance option, see notes below.
  relevanceKey: 'relevance',

  // Keyword filter is sorting the results already by relevance.
  // If keyword filter is active, we need to disable sorting.
  conflictingFilters: ['keyword'],

  options: [
    { key: 'createdAt', label: 'Newest' },
    { key: '-createdAt', label: 'Oldest' },
    { key: '-price', label: 'Lowest price' },
    { key: 'price', label: 'Highest price' },

    // The relevance is only used for keyword search, but the
    // parameter isn't sent to the Marketplace API. The key is purely
    // for handling the internal state of the sorting dropdown.
    { key: 'relevance', label: 'Relevance', longLabel: 'Relevance (Keyword search)' },
  ],
};

export const userType = [
  { key: 'student', label: 'Student' },
  { key: 'teacher', label: 'Teacher' },
];
export const languages = [
  {
    label: 'Abkhazian',
    value: 'ab',
    key: 'ab',
  },
  {
    label: 'Afar',
    value: 'aa',
    key: 'aa',
  },
  {
    label: 'Afrikaans',
    value: 'af',
    key: 'af',
  },
  {
    label: 'Akan',
    value: 'ak',
    key: 'ak',
  },
  {
    label: 'Albanian',
    value: 'sq',
    key: 'sq',
  },
  {
    label: 'Amharic',
    value: 'am',
    key: 'am',
  },
  {
    label: 'Arabic',
    value: 'ar',
    key: 'ar',
  },
  {
    label: 'Aragonese',
    value: 'an',
    key: 'an',
  },
  {
    label: 'Armenian',
    value: 'hy',
    key: 'hy',
  },
  {
    label: 'Assamese',
    value: 'as',
    key: 'as',
  },
  {
    label: 'Avaric',
    value: 'av',
    key: 'av',
  },
  {
    label: 'Avestan',
    value: 'ae',
    key: 'ae',
  },
  {
    label: 'Aymara',
    value: 'ay',
    key: 'ay',
  },
  {
    label: 'Azerbaijani',
    value: 'az',
    key: 'az',
  },
  {
    label: 'Bambara',
    value: 'bm',
    key: 'bm',
  },
  {
    label: 'Bashkir',
    value: 'ba',
    key: 'ba',
  },
  {
    label: 'Basque',
    value: 'eu',
    key: 'eu',
  },
  {
    label: 'Belarusian',
    value: 'be',
    key: 'be',
  },
  {
    label: 'Bengali',
    value: 'bn',
    key: 'bn',
  },
  {
    label: 'Bihari languages',
    value: 'bh',
    key: 'bh',
  },
  {
    label: 'Bislama',
    value: 'bi',
    key: 'bi',
  },
  {
    label: 'Bosnian',
    value: 'bs',
    key: 'bs',
  },
  {
    label: 'Breton',
    value: 'br',
    key: 'br',
  },
  {
    label: 'Bulgarian',
    value: 'bg',
    key: 'bg',
  },
  {
    label: 'Burmese',
    value: 'my',
    key: 'my',
  },
  {
    label: 'Catalan, Valencian',
    value: 'ca',
    key: 'ca',
  },
  {
    label: 'Central Khmer',
    value: 'km',
    key: 'km',
  },
  {
    label: 'Chamorro',
    value: 'ch',
    key: 'ch',
  },
  {
    label: 'Chechen',
    value: 'ce',
    key: 'ce',
  },
  {
    label: 'Chichewa, Chewa, Nyanja',
    value: 'ny',
    key: 'ny',
  },
  {
    label: 'Chinese',
    value: 'zh',
    key: 'zh',
  },
  {
    label: 'Church Slavonic, Old Bulgarian, Old Church Slavonic',
    value: 'cu',
    key: 'cu',
  },
  {
    label: 'Chuvash',
    value: 'cv',
    key: 'cv',
  },
  {
    label: 'Cornish',
    value: 'kw',
    key: 'kw',
  },
  {
    label: 'Corsican',
    value: 'co',
    key: 'co',
  },
  {
    label: 'Cree',
    value: 'cr',
    key: 'cr',
  },
  {
    label: 'Croatian',
    value: 'hr',
    key: 'hr',
  },
  {
    label: 'Czech',
    value: 'cs',
    key: 'cs',
  },
  {
    label: 'Danish',
    value: 'da',
    key: 'da',
  },
  {
    label: 'Divehi, Dhivehi, Maldivian',
    value: 'dv',
    key: 'dv',
  },
  {
    label: 'Dutch, Flemish',
    value: 'nl',
    key: 'nl',
  },
  {
    label: 'Dzongkha',
    value: 'dz',
    key: 'dz',
  },
  {
    label: 'English',
    value: 'en',
    key: 'en',
  },
  {
    label: 'Esperanto',
    value: 'eo',
    key: 'eo',
  },
  {
    label: 'Estonian',
    value: 'et',
    key: 'et',
  },
  {
    label: 'Ewe',
    value: 'ee',
    key: 'ee',
  },
  {
    label: 'Faroese',
    value: 'fo',
    key: 'fo',
  },
  {
    label: 'Fijian',
    value: 'fj',
    key: 'fj',
  },
  {
    label: 'Finnish',
    value: 'fi',
    key: 'fi',
  },
  {
    label: 'French',
    value: 'fr',
    key: 'fr',
  },
  {
    label: 'Fulah',
    value: 'ff',
    key: 'ff',
  },
  {
    label: 'Gaelic, Scottish Gaelic',
    value: 'gd',
    key: 'gd',
  },
  {
    label: 'Galician',
    value: 'gl',
    key: 'gl',
  },
  {
    label: 'Ganda',
    value: 'lg',
    key: 'lg',
  },
  {
    label: 'Georgian',
    value: 'ka',
    key: 'ka',
  },
  {
    label: 'German',
    value: 'de',
    key: 'de',
  },
  {
    label: 'Gikuyu, Kikuyu',
    value: 'ki',
    key: 'ki',
  },
  {
    label: 'Greek (Modern)',
    value: 'el',
    key: 'el',
  },
  {
    label: 'Greenlandic, Kalaallisut',
    value: 'kl',
    key: 'kl',
  },
  {
    label: 'Guarani',
    value: 'gn',
    key: 'gn',
  },
  {
    label: 'Gujarati',
    value: 'gu',
    key: 'gu',
  },
  {
    label: 'Haitian, Haitian Creole',
    value: 'ht',
    key: 'ht',
  },
  {
    label: 'Hausa',
    value: 'ha',
    key: 'ha',
  },
  {
    label: 'Hebrew',
    value: 'he',
    key: 'he',
  },
  {
    label: 'Herero',
    value: 'hz',
    key: 'hz',
  },
  {
    label: 'Hindi',
    value: 'hi',
    key: 'hi',
  },
  {
    label: 'Hiri Motu',
    value: 'ho',
    key: 'ho',
  },
  {
    label: 'Hungarian',
    value: 'hu',
    key: 'hu',
  },
  {
    label: 'Icelandic',
    value: 'is',
    key: 'is',
  },
  {
    label: 'Ido',
    value: 'io',
    key: 'io',
  },
  {
    label: 'Igbo',
    value: 'ig',
    key: 'ig',
  },
  {
    label: 'Indonesian',
    value: 'id',
    key: 'id',
  },
  {
    label: 'Interlingua (International Auxiliary Language Association)',
    value: 'ia',
    key: 'ia',
  },
  {
    label: 'Interlingue',
    value: 'ie',
    key: 'ie',
  },
  {
    label: 'Inuktitut',
    value: 'iu',
    key: 'iu',
  },
  {
    label: 'Inupiaq',
    value: 'ik',
    key: 'ik',
  },
  {
    label: 'Irish',
    value: 'ga',
    key: 'ga',
  },
  {
    label: 'Italian',
    value: 'it',
    key: 'it',
  },
  {
    label: 'Japanese',
    value: 'ja',
    key: 'ja',
  },
  {
    label: 'Javanese',
    value: 'jv',
    key: 'jv',
  },
  {
    label: 'Kannada',
    value: 'kn',
    key: 'kn',
  },
  {
    label: 'Kanuri',
    value: 'kr',
    key: 'kr',
  },
  {
    label: 'Kashmiri',
    value: 'ks',
    key: 'ks',
  },
  {
    label: 'Kazakh',
    value: 'kk',
    key: 'kk',
  },
  {
    label: 'Kinyarwanda',
    value: 'rw',
    key: 'rw',
  },
  {
    label: 'Komi',
    value: 'kv',
    key: 'kv',
  },
  {
    label: 'Kongo',
    value: 'kg',
    key: 'kg',
  },
  {
    label: 'Korean',
    value: 'ko',
    key: 'ko',
  },
  {
    label: 'Kwanyama, Kuanyama',
    value: 'kj',
    key: 'kj',
  },
  {
    label: 'Kurdish',
    value: 'ku',
    key: 'ku',
  },
  {
    label: 'Kyrgyz',
    value: 'ky',
    key: 'ky',
  },
  {
    label: 'Lao',
    value: 'lo',
    key: 'lo',
  },
  {
    label: 'Latin',
    value: 'la',
    key: 'la',
  },
  {
    label: 'Latvian',
    value: 'lv',
    key: 'lv',
  },
  {
    label: 'Letzeburgesch, Luxembourgish',
    value: 'lb',
    key: 'lb',
  },
  {
    label: 'Limburgish, Limburgan, Limburger',
    value: 'li',
    key: 'li',
  },
  {
    label: 'Lingala',
    value: 'ln',
    key: 'ln',
  },
  {
    label: 'Lithuanian',
    value: 'lt',
    key: 'lt',
  },
  {
    label: 'Luba-Katanga',
    value: 'lu',
    key: 'lu',
  },
  {
    label: 'Macedonian',
    value: 'mk',
    key: 'mk',
  },
  {
    label: 'Malagasy',
    value: 'mg',
    key: 'mg',
  },
  {
    label: 'Malay',
    value: 'ms',
    key: 'ms',
  },
  {
    label: 'Malayalam',
    value: 'ml',
    key: 'ml',
  },
  {
    label: 'Maltese',
    value: 'mt',
    key: 'mt',
  },
  {
    label: 'Manx',
    value: 'gv',
    key: 'gv',
  },
  {
    label: 'Maori',
    value: 'mi',
    key: 'mi',
  },
  {
    label: 'Marathi',
    value: 'mr',
    key: 'mr',
  },
  {
    label: 'Marshallese',
    value: 'mh',
    key: 'mh',
  },
  {
    label: 'Moldovan, Moldavian, Romanian',
    value: 'ro',
    key: 'ro',
  },
  {
    label: 'Mongolian',
    value: 'mn',
    key: 'mn',
  },
  {
    label: 'Nauru',
    value: 'na',
    key: 'na',
  },
  {
    label: 'Navajo, Navaho',
    value: 'nv',
    key: 'nv',
  },
  {
    label: 'Northern Ndebele',
    value: 'nd',
    key: 'nd',
  },
  {
    label: 'Ndonga',
    value: 'ng',
    key: 'ng',
  },
  {
    label: 'Nepali',
    value: 'ne',
    key: 'ne',
  },
  {
    label: 'Northern Sami',
    value: 'se',
    key: 'se',
  },
  {
    label: 'Norwegian',
    value: 'no',
    key: 'no',
  },
  {
    label: 'Norwegian Bokmål',
    value: 'nb',
    key: 'nb',
  },
  {
    label: 'Norwegian Nynorsk',
    value: 'nn',
    key: 'nn',
  },
  {
    label: 'Nuosu, Sichuan Yi',
    value: 'ii',
    key: 'ii',
  },
  {
    label: 'Occitan (post 1500)',
    value: 'oc',
    key: 'oc',
  },
  {
    label: 'Ojibwa',
    value: 'oj',
    key: 'oj',
  },
  {
    label: 'Oriya',
    value: 'or',
    key: 'or',
  },
  {
    label: 'Oromo',
    value: 'om',
    key: 'om',
  },
  {
    label: 'Ossetian, Ossetic',
    value: 'os',
    key: 'os',
  },
  {
    label: 'Pali',
    value: 'pi',
    key: 'pi',
  },
  {
    label: 'Panjabi, Punjabi',
    value: 'pa',
    key: 'pa',
  },
  {
    label: 'Pashto, Pushto',
    value: 'ps',
    key: 'ps',
  },
  {
    label: 'Persian',
    value: 'fa',
    key: 'fa',
  },
  {
    label: 'Polish',
    value: 'pl',
    key: 'pl',
  },
  {
    label: 'Portuguese',
    value: 'pt',
    key: 'pt',
  },
  {
    label: 'Quechua',
    value: 'qu',
    key: 'qu',
  },
  {
    label: 'Romansh',
    value: 'rm',
    key: 'rm',
  },
  {
    label: 'Rundi',
    value: 'rn',
    key: 'rn',
  },
  {
    label: 'Russian',
    value: 'ru',
    key: 'ru',
  },
  {
    label: 'Samoan',
    value: 'sm',
    key: 'sm',
  },
  {
    label: 'Sango',
    value: 'sg',
    key: 'sg',
  },
  {
    label: 'Sanskrit',
    value: 'sa',
    key: 'sa',
  },
  {
    label: 'Sardinian',
    value: 'sc',
    key: 'sc',
  },
  {
    label: 'Serbian',
    value: 'sr',
    key: 'sr',
  },
  {
    label: 'Shona',
    value: 'sn',
    key: 'sn',
  },
  {
    label: 'Sindhi',
    value: 'sd',
    key: 'sd',
  },
  {
    label: 'Sinhala, Sinhalese',
    value: 'si',
    key: 'si',
  },
  {
    label: 'Slovak',
    value: 'sk',
    key: 'sk',
  },
  {
    label: 'Slovenian',
    value: 'sl',
    key: 'sl',
  },
  {
    label: 'Somali',
    value: 'so',
    key: 'so',
  },
  {
    label: 'Sotho, Southern',
    value: 'st',
    key: 'st',
  },
  {
    label: 'South Ndebele',
    value: 'nr',
    key: 'nr',
  },
  {
    label: 'Spanish, Castilian',
    value: 'es',
    key: 'es',
  },
  {
    label: 'Sundanese',
    value: 'su',
    key: 'su',
  },
  {
    label: 'Swahili',
    value: 'sw',
    key: 'sw',
  },
  {
    label: 'Swati',
    value: 'ss',
    key: 'ss',
  },
  {
    label: 'Swedish',
    value: 'sv',
    key: 'sv',
  },
  {
    label: 'Tagalog',
    value: 'tl',
    key: 'tl',
  },
  {
    label: 'Tahitian',
    value: 'ty',
    key: 'ty',
  },
  {
    label: 'Tajik',
    value: 'tg',
    key: 'tg',
  },
  {
    label: 'Tamil',
    value: 'ta',
    key: 'ta',
  },
  {
    label: 'Tatar',
    value: 'tt',
    key: 'tt',
  },
  {
    label: 'Telugu',
    value: 'te',
    key: 'te',
  },
  {
    label: 'Thai',
    value: 'th',
    key: 'th',
  },
  {
    label: 'Tibetan',
    value: 'bo',
    key: 'bo',
  },
  {
    label: 'Tigrinya',
    value: 'ti',
    key: 'ti',
  },
  {
    label: 'Tonga (Tonga Islands)',
    value: 'to',
    key: 'to',
  },
  {
    label: 'Tsonga',
    value: 'ts',
    key: 'ts',
  },
  {
    label: 'Tswana',
    value: 'tn',
    key: 'tn',
  },
  {
    label: 'Turkish',
    value: 'tr',
    key: 'tr',
  },
  {
    label: 'Turkmen',
    value: 'tk',
    key: 'tk',
  },
  {
    label: 'Twi',
    value: 'tw',
    key: 'tw',
  },
  {
    label: 'Uighur, Uyghur',
    value: 'ug',
    key: 'ug',
  },
  {
    label: 'Ukrainian',
    value: 'uk',
    key: 'uk',
  },
  {
    label: 'Urdu',
    value: 'ur',
    key: 'ur',
  },
  {
    label: 'Uzbek',
    value: 'uz',
    key: 'uz',
  },
  {
    label: 'Venda',
    value: 've',
    key: 've',
  },
  {
    label: 'Vietnamese',
    value: 'vi',
    key: 'vi',
  },
  {
    label: 'Volap_k',
    value: 'vo',
    key: 'vo',
  },
  {
    label: 'Walloon',
    value: 'wa',
    key: 'wa',
  },
  {
    label: 'Welsh',
    value: 'cy',
    key: 'cy',
  },
  {
    label: 'Western Frisian',
    value: 'fy',
    key: 'fy',
  },
  {
    label: 'Wolof',
    value: 'wo',
    key: 'wo',
  },
  {
    label: 'Xhosa',
    value: 'xh',
    key: 'xh',
  },
  {
    label: 'Yiddish',
    value: 'yi',
    key: 'yi',
  },
  {
    label: 'Yoruba',
    value: 'yo',
    key: 'yo',
  },
  {
    label: 'Zhuang, Chuang',
    value: 'za',
    key: 'za',
  },
  {
    label: 'Zulu',
    value: 'zu',
    key: 'zu',
  },
];

export const workoutTypes = [{ key: 'yoga', label: 'Yoga' }, { key: 'stretch', label: 'Stretch' }];
