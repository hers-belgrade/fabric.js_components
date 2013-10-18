#!/usr/bin/env python
import sys
sys.path.append ('/usr/share/inkscape/extensions')
import inkex
import gettext
from simplestyle import *
_ = gettext.gettext

NSS = {
u'sodipodi' :u'http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd',
u'cc'       :u'http://creativecommons.org/ns#',
u'ccOLD'    :u'http://web.resource.org/cc/',
u'svg'      :u'http://www.w3.org/2000/svg',
u'dc'       :u'http://purl.org/dc/elements/1.1/',
u'rdf'      :u'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
u'inkscape' :u'http://www.inkscape.org/namespaces/inkscape',
u'xlink'    :u'http://www.w3.org/1999/xlink',
u'xml'      :u'http://www.w3.org/XML/1998/namespace'
}

ns=u'http://www.inkscape.org/namespaces/inkscape'

class SetEventTargets (inkex.Effect):
	def __init__(self):
		inkex.Effect.__init__(self)
	
	def effect(self):
		p = '{'+ns+'}'
		"""
		path = '//*[@inkscape:groupmode="layer"]'
		elements = self.document.xpath(path, namespaces=NSS)
		for node in elements:
			node.set('id',node.get(p+'label'));
		"""
		if not self.selected:
			inkex.errormsg(_("Nothing selected"))
			return

		keys = self.selected.keys();
		if len(keys) > 1:
			inkex.errormsg(_("More than one selected"))
			return
	
		selected = self.selected[keys[0]];
		selected.set(p+'event_target', 'true')

		'''	
		TODO: remove all attribs within this layer
		path = '//ancestor::*[@inkscape:groupmode="layer"]'
		parents = selected.xpath(path, namespaces=NSS)
		inkex.debug(parents)
		'''






eff = SetEventTargets();
eff.affect();
