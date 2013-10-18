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

class SetLayerIDS (inkex.Effect):
	def __init__(self):
		inkex.Effect.__init__(self)
	
	def effect(self):
		path = '//*[@inkscape:groupmode="layer"]'
		elements = self.document.xpath(path, namespaces=NSS)
		p = '{'+ns+'}'
		for node in elements:
			node.set('id',node.get(p+'label'));





eff = SetLayerIDS();
eff.affect();
