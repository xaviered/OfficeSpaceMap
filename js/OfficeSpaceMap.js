/**
 * @type [] Element selector for the room text info
 */
const ROOM_ELEMENT_SELECTOR = ["a[class='AP8Kec']", "a[jscontroller='H5Cjge']"];

/**
 * @type {string} Default building name
 */
const DEFAULT_BUILDING = "NY-770 Broadway";

/**
 * @type {string} If a URL has this in it, an officemap icon will get added
 */
const GOOGLE_MAPS_URL = "https://maps.google.com";

/**
 * Static class to interact with DOM
 */
class OfficeSpaceMap {

  /**
   * @type {int} Interval for loading event button listeners
   */
  static addMapInterval = null;

  /**
   * Constructor
   */
  constructor() {
    this.forceAddButtonListeners();
  }

  /**
   * Adds icons next to the room names
   */
  addMapIcons() {
    let elements = [];
    for (let i = 0; i < ROOM_ELEMENT_SELECTOR.length; i++) {
      elements = elements.concat($(ROOM_ELEMENT_SELECTOR[i]).toArray());
    }

    $.each($(elements), (i, ele) => {
      let $ele = $(ele);
      let href = $ele.attr('href');
      let r = new RegExp(GOOGLE_MAPS_URL + '.+', 'i');
      if (r.test(href)) {
        let $c = $ele.parent().children(".os_map-icon")[0];
        // no map icon found, add it in
        if ($c == null) {
          let roomInfo = this.getRoomInfo($ele.text());
          $ele.addClass("os_location-link");
          $ele.closest('content').addClass("os_location-content");
          $ele.parent().prepend(this.getMapElement(roomInfo));
        }
      }
    });
  }

  // @todo: Load iFrame instead of new window
  // /**
  //  * @type {HTMLFrameElement} Frame to show map
  //  */
  // static frameElement;
  // getFrameElement() {
  //   if (OfficeSpaceMap.frameElement == null) {
  //     OfficeSpaceMap.frameElement = document.createElement('DIV');
  //     OfficeSpaceMap.frameElement.setAttribute("class", "os_mapframe os_hidden");
  //     OfficeSpaceMap.frameElement.innerHTML = '<div id="closeButton">X</div>';
  //     OfficeSpaceMap.frameElement.innerHTML += '<iframe width="100%" height="100%"></iframe>';
  //     $(OfficeSpaceMap.frameElement).children("#closeButton").on("click", () => {
  //       console.log("hiding mapframe");
  //       $(OfficeSpaceMap.frameElement).addClass('os_hidden');
  //     });
  //     $(document.body).append(OfficeSpaceMap.frameElement);
  //   }
  //
  //   return OfficeSpaceMap.frameElement;
  // }

  /**
   * Loads the room on map in a new window
   * @param roomInfo
   */
  loadMap(roomInfo) {
    let w = 2000;
    let h = 1000;
    let url = this.getFloorSearchLink(roomInfo.room);
    let f = window.open(url, "mapframe", "width=" + w + ", height=" + h + ", menubar=no, toolbar=no, location=no, personalbar=no, status=no, minimizable=no");
    f.focus();
  }

  /**
   * Gets map element to add to document
   * @param roomInfo
   * @returns {HTMLElement}
   */
  getMapElement(roomInfo) {
    let a = document.createElement('IMG');
    a.setAttribute("class", "os_map-icon");
    a.setAttribute("src", chrome.runtime.getURL("images/map-icon.png"));
    a.setAttribute("alt", "OfficeSpace Map!");
    $(a).on("click", (e) => {
      this.loadMap(roomInfo);
    });
    return a;
  }

  /**
   * Gets search URL for the given term
   * @param searchTerm
   * @returns {string}
   */
  getFloorSearchLink(searchTerm) {
    return "https://aol.officespacesoftware.com/vd/vd.jsp?search=" + encodeURI(searchTerm);
  }

  /**
   * Gets room name from given string
   * Recognizes these formats:
   * Bleecker
   * Vanguard - 6th FL
   * training room on the 5th floor
   * NY-770 Broadway-5B:B01 Angelika (4)
   * NY-770 Broadway-5B:A148 St Mark's Place (VTC)(12)
   *
   * @param {string} content
   * @return {{string}, {string}, {string}} i.e. {'building': building, 'room': room, 'floor': floor}
   */
  getRoomInfo(content) {
    // i.e. NY-770 Broadway-5B:B01 Angelika (4)
    let match = /(.+)\s*-\s*(\S+:\S+)/.exec(content);
    match = match ? match : [];
    let building = match[1] ? match[1] : DEFAULT_BUILDING;
    let room = match[2] ? match[2] : content;

    // i.e. Vanguard - 6th FL
    match = /(.+)\s* - \s*(.+)/.exec(content);
    match = match ? match : [];
    room = match[1] ? match[1] : room;
    let floor = match[2] ? match[2] : '';

    // i.e. training room on the 5th floor
    match = /(.+)\s* on the \s*(.+)/.exec(content);
    match = match ? match : [];
    room = match[1] ? match[1] : room;
    floor = match[2] ? match[2] : floor;

    // return {'building': DEFAULT_BUILDING, 'room': content, 'floor': ''};
    return {'building': building, 'room': room, 'floor': floor, 'content': content};
  }

  /**
   * Force adds even button listeners to make sure we always load map icons, even if user navigates away from current view
   */
  forceAddButtonListeners() {
    OfficeSpaceMap.addMapInterval = window.setInterval(() => {
      this.addMapIcons();
    }, 600);
  }
}
