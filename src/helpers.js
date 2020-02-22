export const getDefaultSelectedItemOptions = (optionGroups) => {
  return optionGroups.map(optionGroup => {
    const newOptGroup = { ...optionGroup }
    newOptGroup.options = newOptGroup.options
      .filter(option => newOptGroup.default_selected.includes(option.id))
      .map(option => {
        const newOption = { ...option }
        newOption.option_groups = getDefaultSelectedItemOptions(newOption.option_groups)
        return newOption
      })
    return newOptGroup
  })
}