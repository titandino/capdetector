const { Readable } = require('tera-data-parser/lib/protocol/stream');
const Command = require('command');

const CAP_S_OPCODE = 35033;
const FWC_ZONE = 112;
const CS_ZONE = 116;

const FWC_PYRES = [
  null, //No pyre 0
  { x:7747, y:38402, z:1690 },
  { x:3221, y:40203, z:1581 },
  { x:11993, y:36810, z:1550 }
];

const CS_PYRES = [
  //TODO, not been in a CS game with anything debug/dev related yet
];

module.exports = function CapDetector(dispatch) {
  const command = Command(dispatch);
  const { player, entity } = require('library')(dispatch);

  dispatch.hook('*', 'raw', { order: 999, type: 'all' }, (code, data, incoming, fake) => {
    if (code == CAP_S_OPCODE && incoming) {
      let buffer = new Readable(data);
      let length = buffer.uint16();
      let opcode = buffer.uint16();
      let pyreId = buffer.uint32();
      let gameId = buffer.uint64();
      let capper = entity.players[gameId];
      let pyre = player.zone == FWC_ZONE ? FWC_PYRES[pyreId] : CS_PYRES[pyreId];
      if (capper && pyre) {
        if (distance(capper.pos, pyre) > 50) {
          dispatch.toClient('S_CHAT', 2, {
    				channel: 21,
    				authorName: 'CapDetector',
    				message: capper.name + ' IS USING CAP MODULE ON PYRE ' + pyreId + '('+distance(capper.pos, pyre)+')'
    			});
        }
        console.log('' + capper.name + ' capturing pyre: ' + pyreId + ' at distance: ' + distance(capper.pos, pyre));
      }
    }
  });

  function distance(p1, p2) {
    return Math.sqrt(((p2.x - p1.x) * (p2.x - p1.x)) + ((p2.y - p1.y) * (p2.y - p1.y)) + ((p2.z - p1.z) * (p2.z - p1.z)));
  }
}
