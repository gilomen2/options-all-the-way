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
    return formatOptionGroupForSelections(newOptGroup)
  })
}

export const pickSelectionsForOptionGroup = (optGroup, selectedItemOptions) => {
  return selectedItemOptions.find(opt => opt.id === optGroup.id)
}

export const formatOptionGroupForSelections = (optGroup) => {
  return {
    id: optGroup.id,
    name: optGroup.name,
    options: optGroup.options
  }
}
