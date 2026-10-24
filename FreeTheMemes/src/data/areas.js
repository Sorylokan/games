export const AREAS = Object.freeze({
  OTAKUS_PARADISE: Object.freeze({
    id: "otakus-paradise",
    nameKey: "areas.otakusParadise.name",
    dieTotals: [2, 3],
    effect: "draw-notification-and-give",
    effectKey: "areas.otakusParadise.effect"
  }),
  BED_OF_YOUR_DREAMS: Object.freeze({
    id: "bed-of-your-dreams",
    nameKey: "areas.bedOfYourDreams.name",
    dieTotals: [4, 5],
    effect: "draw-white",
    effectKey: "areas.bedOfYourDreams.effect"
  }),
  GRANDMAS_NEW_BEDROOM: Object.freeze({
    id: "grandmas-new-bedroom",
    nameKey: "areas.grandmasNewBedroom.name",
    dieTotals: [6],
    effect: "draw-black",
    effectKey: "areas.grandmasNewBedroom.effect"
  }),
  ATTIC_HATCH: Object.freeze({
    id: "attic-hatch",
    nameKey: "areas.atticHatch.name",
    dieTotals: [8],
    effect: "choose-deck-and-draw",
    effectKey: "areas.atticHatch.effect"
  }),
  TOXIC_RELATIONSHIP: Object.freeze({
    id: "toxic-relationship",
    nameKey: "areas.toxicRelationship.name",
    dieTotals: [9],
    effect: "damage-or-heal",
    effectKey: "areas.toxicRelationship.effect"
  }),
  PICKPOCKET_BOULEVARD: Object.freeze({
    id: "pickpocket-boulevard",
    nameKey: "areas.pickpocketBoulevard.name",
    dieTotals: [10],
    effect: "steal-equipment",
    effectKey: "areas.pickpocketBoulevard.effect"
  })
});

export const AREA_BY_DIE_TOTAL = Object.freeze(
  Object.fromEntries(
    Object.values(AREAS).flatMap((area) => area.dieTotals.map((total) => [total, area.id]))
  )
);

export const getAreaForDieTotal = (total) => AREA_BY_DIE_TOTAL[total] ?? null;