#!/usr/bin/env python
import sys
sys.path.append ('/usr/share/inkscape/extensions')
import inkex
import gettext
from simplestyle import *
_ = gettext.gettext


class MakePlaceholderEffect (inkex.Effect):
	def __init__(self):
		inkex.Effect.__init__(self)
		self.OptionParser.add_option('-n', '--name', action = 'store', type='string', dest='name', default = '', help = 'What is name of your placeholder?')
		self.OptionParser.add_option('-w', '--width', action = 'store', type='float',dest='width', default=0, help = 'Placeholder width')
		self.OptionParser.add_option('-g', '--height', action = 'store', type='float',dest='height', default=0, help = 'Placeholder width')

	def effect(self):
		layer = self.current_layer
		name = self.options.name
		w = self.options.width
		h = self.options.height

		old = self.getElementById(name)
		if not old is None:
			old.getparent().remove(old)

		group = inkex.etree.Element('g', {
			'fill':'none',
			'stroke':'none',
			'id':name
		})


		style = {'stroke':'#000000', 'fill':'#ffffff', 'stroke-width':'1'}
		attribs = {
				'style': formatStyle(style),
				'height':str(h),
				'width':str(w),
				'x':str(0),
				'y':str(0),
				'id':name+'_placeholder'
				}
		rect = inkex.etree.SubElement(group, inkex.addNS('rect', 'svg'),attribs)
		layer.append(group)

		
eff = MakePlaceholderEffect()
eff.affect()
