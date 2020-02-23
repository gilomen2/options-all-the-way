import { formatOptionGroupForSelections, getDefaultSelectedItemOptions } from '../../src/helpers'
import classNames from 'classnames'
import React from 'react'

export const App = ({ menuItems }) => {
  return (
    <div className='App'>
      <div className='menu'>
        {menuItems.map(item => <MenuItem
          key={item.id}
          item={item} />)}
      </div>
    </div>
  )
}

const MenuItem = ({ item }) => {
  const [currentSelections, setCurrentSelections] = useState(getDefaultSelectedItemOptions(item.option_groups))

  const handleSetSelections = newOptionGroupSelections => {
    const newSelections = currentSelections.map(opt => {
      if (opt.id === newOptionGroupSelections.id) {
        return newOptionGroupSelections
      }
      return opt
    })

    setCurrentSelections(newSelections)
  }

  return (
    <div>
      <span className='item-name'>{item.name}</span>
      {item.option_groups.map(optionGroup =>
        <OptionGroup
          key={optionGroup.id}
          optionGroup={optionGroup}
          currentOptionGroupSelections={pickSelectionsForOptionGroup(optionGroup, currentSelections)}
          onChange={handleSetSelections}
        />)}
    </div>
  )
}

const OptionGroup = ({ optionGroup, currentOptionGroupSelections, onChange }) => {
  const {
    options: currentOptionGroupSelectedOptions = []
  } = currentOptionGroupSelections

  const handleOptionChange = optionGroup => (e, changedOption) => {
    const newOptionGroup = { ...optionGroup }
    const newChangedOption = { ...changedOption }

    // If the changed option is selected, we get the default selections for it's option_groups so that we can show them
    // as selected as well
    if (e.target.checked) {
      newChangedOption.option_groups = getDefaultSelectedItemOptions(newChangedOption.option_groups)
    }

    const isRadio = optionGroup.max_selectable === 1 && optionGroup.min_selectable === 1
    newOptionGroup.options = isRadio
      // If it's a radio button, we can replace the current selection with the new selection
      ? [newChangedOption]
      // If it's a checkbox, we first determine if the change is that it has become checked or unchecked
      : e.target.checked
        // If it is checked, we add the new selection to the current selections
        ? [...currentOptionGroupSelectedOptions, newChangedOption]
        // If it isn't checked, we filter the current selections to only those that don't match the id of the changed option
        : currentOptionGroupSelectedOptions.filter(opt => opt.id !== changedOption.id)

    // We finally pass the newOptionGroup to the onChange handler
    onChange(newOptionGroup)
  }

  const nestedHandleOptionChange = (optionId, parentOptionSelections) => changedOptionGroup => {
    const newParentOptionSelections = parentOptionSelections.map(opt => {
      const newOpt = { ...opt }
      if (newOpt.id === optionId) {
        newOpt.option_groups = newOpt.option_groups.map(og => {
          let newOptionGroup = { ...formatOptionGroupForSelections(og) }
          if (newOptionGroup.id === changedOptionGroup.id) {
            newOptionGroup = changedOptionGroup
          }
          return newOptionGroup
        })
      }
      return newOpt
    })

    const newSelections = { ...currentOptionGroupSelections }
    newSelections.options = newParentOptionSelections

    onChange(newSelections)
  }

  return (

    <div className={classNames('option-group')}>
      <div className='option-group-name'>{optionGroup.name}</div>
      <div className='options'>
        <OptionsList
          optionGroup={optionGroup}
          selectedOptions={currentOptionGroupSelectedOptions}
          onChange={handleOptionChange(optionGroup)}
          onNestedChange={nestedHandleOptionChange}
        />
      </div>
    </div>

  )
}