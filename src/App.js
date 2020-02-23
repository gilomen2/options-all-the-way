import React, { useState } from 'react'
import './App.css'
import { item } from './sample-data'
import { getDefaultSelectedItemOptions, pickSelectionsForOptionGroup } from './helpers'

export const App = () => {
  return (
    <div className='App'>
      <MenuItem item={item} />
    </div>
  )
}

const MenuItem = ({ item }) => {
  const [currentSelections, setCurrentSelections] = useState(getDefaultSelectedItemOptions(item.option_groups))

  const handleOptionSelect = selectedOptions => {
    const newSelectedOptions = currentSelections.map(opt => {
      if (opt.id === selectedOptions.id) {
        return selectedOptions
      }
      return opt
    })
    setCurrentSelections(newSelectedOptions)
  }

  return (
    <>
      <span className='item-name'>{item.name}</span>
      {item.option_groups.map(optionGroup => <OptionGroup
        key={optionGroup.id}
        onChange={handleOptionSelect}
        handleSelect={handleOptionSelect}
        optionGroupSelections={pickSelectionsForOptionGroup(optionGroup, currentSelections)}
        optionGroup={optionGroup} />)}
    </>
  )
}

const OptionGroup = ({ optionGroup, optionGroupSelections, onChange }) => {
  const {
    options: optionGroupSelectedOptions = []
  } = optionGroupSelections

  const handleSelect = optionGroup => (e, selectedOption) => {
    const isRadio = optionGroup.max_selectable === 1 && optionGroup.min_selectable === 1
    const newOptionGroup = { ...optionGroup }
    const newSelectedOption = { ...selectedOption }
    newSelectedOption.option_groups = getDefaultSelectedItemOptions(newSelectedOption.option_groups)
    newOptionGroup.options = isRadio
      ? [newSelectedOption]
      : e.target.checked
        ? [...optionGroupSelectedOptions, newSelectedOption]
        : optionGroupSelectedOptions.filter(opt => opt.id !== selectedOption.id)
    onChange(newOptionGroup)
  }

  const nestedHandleSelect = (optionId, parentSelectedOptions) => selectedOption => {
    const newParent = parentSelectedOptions.map(opt => {
      const newOpt = { ...opt }
      if (newOpt.id === optionId) {
        newOpt.option_groups = newOpt.option_groups.map(option => {
          let newOption = { ...option }
          if (newOption.id === selectedOption.id && newOption.name === selectedOption.name) {
            newOption = selectedOption
          }
          return newOption
        })
      }
      return newOpt
    })
    const newSelections = { ...optionGroupSelections }
    newSelections.options = newParent
    onChange(newSelections)
  }

  return (
    <div className='option-group'>
      <div className='option-group-name'>{optionGroup.name}</div>
      <div className='options'>
        <OptionsList optionGroup={optionGroup}
          selectedOptions={optionGroupSelectedOptions}
          onChange={handleSelect(optionGroup)}
          onNestedChange={nestedHandleSelect}
        />
      </div>
    </div>
  )
}

const OptionsList = ({ optionGroup, selectedOptions, onChange, onNestedChange }) => {
  const isRadio = optionGroup.min_selectable === 1 && optionGroup.max_selectable === 1
  return (
    <>
      {optionGroup.options.map(option => {
        const isSelected = !!selectedOptions.find(opt => option.id === opt.id)
        return (
          <div key={option.id}>
            <input type={isRadio ? 'radio' : 'checkbox'}
              name={optionGroup.id}
              id={option.id}
              value={option.id}
              onChange={e => onChange(e, option)}
              checked={isSelected} />
            <label htmlFor={option.id}>{option.name}</label>
            {isSelected && option.option_groups.map(og => {
              const selOpts = selectedOptions.find(sel => sel.id === option.id)
              return (<OptionGroup
                key={og.id}
                onChange={onNestedChange(option.id, selectedOptions)}
                optionGroupSelections={pickSelectionsForOptionGroup(og, selOpts.option_groups)}
                optionGroup={og} />)
            })}
          </div>
        )
      })}
    </>
  )
}
