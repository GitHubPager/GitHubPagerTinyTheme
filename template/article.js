var article_template={};
article_template.listItem={'html':' \
<div class="article"> \
<div class="article_title"><a class="article_title_link" href="#/posts/<%=id%>"><%=title%></a></div> \
<div class="article_content"><%=content%></div> \
<div class="article_comment"></div> \
<div class="article_time">Date: <%=date%></div> \
</div>'};
article_template.next={'html':' \
<span class="article_next"><a href="#/nextPage">Next</a></span> \
'};
article_template.prev={'html':' \
<span class="article_prev"><a href="#/prevPage">Prev</a></span> \
'};
article_template.single={'html':' \
<div class="article"> \
<div class="article_title"><a class="article_title_link" href="#/posts/<%=id%>"><%=title%></a></div> \
<div class="article_content"><%=content%></div> \
<div class="article_comment"></div> \
<div class="article_time"><span class="article_time_label">Date:</span><%=date%></div> \
<div class="article_author"><span class="article_author_label">Author:</span><%=author%></div> \
<div class="article_tag"><span class="article_tag_label">Tag:</span><%=tag%></div>\
</div>'};